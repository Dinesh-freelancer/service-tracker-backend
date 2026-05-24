const serviceRequestModel = require('../models/serviceRequestModel');
const assetModel = require('../models/assetModel');
const partsUsedModel = require('../models/partsUsedModel');
const documentModel = require('../models/documentModel');
const { logAudit } = require('../utils/auditLogger');
const { filterServiceRequest, filterServiceRequestList } = require('../utils/responseFilter');
const { AUTH_ROLE_CUSTOMER } = require('../utils/constants');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');
const { buildSearchFilters } = require('../utils/queryHelper');
const NotificationService = require('../utils/notificationService');
const authModel = require('../models/authModel');
const pool = require('../db');

/**
 * Lists service requests with pagination, filtering, and role-based masking.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listServiceRequests(req, res, next) {
    try {
        const role = req.user ? req.user.Role : null;
        const { page, limit, offset } = getPagination(req);

        // Allowed search fields (Updated for Asset-Centric model)
        // Aliases: sr (servicerequest), a (assets), c (customer)
        const searchableFields = [
            'sr.JobNumber',
            'a.InternalTag', 'a.Brand', 'a.PumpModel',
            'a.MotorModel', 'a.SerialNumber',
            'sr.Status', 'c.CustomerName'
        ];

        // Intercept customerId to handle Organization-wide viewing
        if (req.query.customerId) {
            const customerModel = require('../models/customerModel');
            const requestedCustomer = await customerModel.getCustomerById(req.query.customerId);
            if (requestedCustomer && requestedCustomer.OrganizationId) {
                // If it's an organization member, search by OrganizationId instead of specific CustomerId
                req.query.organizationId = requestedCustomer.OrganizationId;
                delete req.query.customerId;
            }
        }

        const filters = buildSearchFilters(req.query, searchableFields);

        let rows, totalCount;

        if (role === AUTH_ROLE_CUSTOMER) {
             // In-memory pagination for customers (security first)
             const result = await serviceRequestModel.getAllServiceRequests(filters);

             let allRows = result.rows || [];

             if (!req.user.CustomerId) {
                 allRows = [];
             } else {
                 allRows = allRows.filter(reqItem => reqItem.CustomerId === req.user.CustomerId);
             }

             totalCount = allRows.length;
             // Slice for pagination
             rows = allRows.slice(offset, offset + limit);

        } else {
            // DB Pagination + Filtering
            const result = await serviceRequestModel.getAllServiceRequests(filters, limit, offset);
            rows = result.rows;
            totalCount = result.totalCount;
        }

        const filteredRows = filterServiceRequestList(rows, role);
        const response = getPaginationData(filteredRows, page, limit, totalCount);

        res.json(response);
    } catch (err) {
        next(err);
    }
}

// Get by job number
async function getServiceRequest(req, res, next) {
    try {
        const role = req.user ? req.user.Role : null;
        const jobNumber = req.params.jobNumber;

        let serviceRequest = await serviceRequestModel.getServiceRequestByJobNumber(jobNumber);
        if (!serviceRequest)
            return res.status(404).json({ error: 'Service request not found' });

        // Security: If Customer, verify ownership
        if (role === AUTH_ROLE_CUSTOMER) {
             if (!req.user.CustomerId || serviceRequest.CustomerId !== req.user.CustomerId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        // Fetch related data in parallel
        const [history, parts, documents, assetJobs] = await Promise.all([
            serviceRequestModel.getHistoryByJobNumber(jobNumber),
            partsUsedModel.getAllPartsUsed(jobNumber),
            documentModel.getDocumentsByJob(jobNumber),
            serviceRequest.AssetId ? serviceRequestModel.getServiceRequestsByAssetId(serviceRequest.AssetId) : Promise.resolve([])
        ]);

        serviceRequest.History = history || [];
        serviceRequest.Parts = parts || [];
        serviceRequest.Documents = documents || [];
        serviceRequest.AssetJobs = assetJobs || [];

        serviceRequest = filterServiceRequest(serviceRequest, role);

        res.json(serviceRequest);
    } catch (err) {
        next(err);
    }
}

// Add new service request
async function createServiceRequest(req, res, next) {
    let connection;
    try {
        const { NewAsset, ...jobData } = req.body;
        let assetId = jobData.AssetId;

        connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Hybrid Flow: Create Asset if needed
            if (!assetId && NewAsset) {
                // Validate NewAsset basics
                if (!NewAsset.Brand) {
                    throw new Error('New Asset requires Brand');
                }

                // Ensure CustomerId is consistent
                NewAsset.CustomerId = jobData.CustomerId;
                // Default AssetType if not provided
                if (!NewAsset.AssetType) NewAsset.AssetType = 'Pumpset';

                const createdAsset = await assetModel.createAsset(NewAsset, connection);
                assetId = createdAsset.AssetId;
            }

            if (!assetId) {
                throw new Error('AssetId is required or valid NewAsset data must be provided.');
            }

            // Prepare Final Job Data
            const finalJobData = {
                JobNumber: await serviceRequestModel.generateJobNumber(connection),
                AssetId: assetId,
                CustomerId: jobData.CustomerId,
                DateReceived: jobData.DateReceived,
                Status: 'Intake', // Default
                ResolutionType: null,
                Notes: jobData.Notes || ''
            };

            const serviceRequest = await serviceRequestModel.addServiceRequest(finalJobData, connection);

            await connection.commit();

            await logAudit({
                JobNumber: serviceRequest.JobNumber,
                ActionType: 'Created',
                ChangedBy: req.user ? req.user.UserId : 'system',
                Details: `ServiceRequest created for Asset ${serviceRequest.InternalTag || assetId}`,
            });

            res.status(201).json(serviceRequest);
        } catch (err) {
            await connection.rollback();
            throw err;
        }
    } catch (err) {
        if (err.message && (err.message.includes('New Asset requires') || err.message.includes('AssetId is required'))) {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    } finally {
        if (connection) connection.release();
    }
}

// Update service request
async function updateServiceRequest(req, res, next) {
    try {
        const { jobNumber } = req.params;
        const updates = req.body;

        // Fetch old job status to compare
        const existingJob = await serviceRequestModel.getServiceRequestByJobNumber(jobNumber);
        if (!existingJob) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // IDOR and Security Check for Customer Role
        if (req.user && req.user.Role === 'Customer') {
            if (existingJob.CustomerId !== req.user.CustomerId) {
                return res.status(403).json({ error: 'Access denied: You can only update your own jobs.' });
            }

            // Customers can ONLY update Status and ResolutionType
            const allowedCustomerUpdates = ['Status', 'ResolutionType'];
            const attemptKeys = Object.keys(updates);
            for (const key of attemptKeys) {
                if (!allowedCustomerUpdates.includes(key)) {
                    return res.status(403).json({ error: `Access denied: Customers cannot update field: ${key}` });
                }
            }

            // State Machine Check: Customers can only act on 'Awaiting Approval' jobs
            if (existingJob.Status !== 'Awaiting Approval') {
                 return res.status(400).json({ error: 'Job is not awaiting approval.' });
            }

            // State Machine Check: Customers can only transition to 'Approved' or 'On Hold' with 'Estimate Rejected'
            const isApproving = updates.Status === 'Approved';
            const isRejecting = updates.Status === 'On Hold' && updates.ResolutionType === 'Estimate Rejected';

            if (!isApproving && !isRejecting) {
                 return res.status(400).json({ error: 'Invalid action. You can only approve or reject the estimate.' });
            }
        }


        // Validate ResolutionType for terminal statuses and On Hold (when rejecting estimates)
        const terminalStatuses = ['Completed', 'Cancelled', 'Rejected', 'Fulfilled'];
        if (updates.Status && terminalStatuses.includes(updates.Status)) {
            if (!updates.ResolutionType && !existingJob.ResolutionType) {
                 return res.status(400).json({ error: `ResolutionType is required when status is ${updates.Status}` });
            }
        }

        // Ensure On Hold with Estimate Rejected is accepted (from customer portal)
        if (updates.Status === 'On Hold' && updates.ResolutionType === 'Estimate Rejected') {
            // Valid case from customer reject action
        }

        const result = await serviceRequestModel.updateServiceRequest(jobNumber, updates);

        // Trigger Notification if Status Changed
        if (updates.Status && existingJob.Status !== updates.Status) {
            // Get username
            let username = 'System';
            if (req.user && req.user.UserId) {
                const user = await authModel.getUserById(req.user.UserId);
                if (user) username = user.Username;
            }

            // Notify Admins/Owners
            await NotificationService.notifyAdminsAndOwners(
                'JobUpdate',
                `Job Status Updated: ${jobNumber}`,
                `Status changed from ${existingJob.Status} to ${updates.Status} by ${username}`,
                jobNumber
            );
        }

        await logAudit({
            JobNumber: jobNumber,
            ActionType: 'Updated',
            ChangedBy: req.user ? req.user.UserId : null,
            Details: `Job updated. Changes: ${Object.keys(updates).join(', ')}`
        });

        res.json({ message: 'Job updated successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listServiceRequests,
    getServiceRequest,
    createServiceRequest,
    updateServiceRequest
};
