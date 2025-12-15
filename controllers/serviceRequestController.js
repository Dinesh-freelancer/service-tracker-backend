const serviceRequestModel = require('../models/serviceRequestModel');
const { logAudit } = require('../utils/auditLogger');
const { filterServiceRequest, filterServiceRequestList } = require('../utils/responseFilter');
const { AUTH_ROLE_CUSTOMER } = require('../utils/constants');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');
const { buildSearchFilters } = require('../utils/queryHelper');
const NotificationService = require('../utils/notificationService');
const authModel = require('../models/authModel');

/**
 * Lists service requests with pagination, filtering, and role-based masking.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listServiceRequests(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        const { page, limit, offset } = getPagination(req);

        // Allowed search fields
        const searchableFields = ['JobNumber', 'PumpBrand', 'PumpModel', 'MotorBrand', 'MotorModel', 'SerialNumber', 'Status'];
        const filters = buildSearchFilters(req.query, searchableFields);

        let rows, totalCount;

        if (role === AUTH_ROLE_CUSTOMER) {
             // In-memory pagination for customers (security first)
             // Fetch ALL matching filters (Note: getAllServiceRequests now accepts filters)
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

        const filteredRows = filterServiceRequestList(rows, role, hideSensitive);
        const response = getPaginationData(filteredRows, page, limit, totalCount);

        res.json(response);
    } catch (err) {
        next(err);
    }
}

// Get by job number
async function getServiceRequest(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let serviceRequest =
            await serviceRequestModel.getServiceRequestByJobNumber(
                req.params.jobNumber
            );
        if (!serviceRequest)
            return res.status(404).json({ error: 'Service request not found' });

        // Security: If Customer, verify ownership
        if (role === AUTH_ROLE_CUSTOMER) {
             if (!req.user.CustomerId || serviceRequest.CustomerId !== req.user.CustomerId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        serviceRequest = filterServiceRequest(serviceRequest, role, hideSensitive);

        res.json(serviceRequest);
    } catch (err) {
        next(err);
    }
}

// Add new service request
async function createServiceRequest(req, res, next) {
    try {
        const serviceRequest = await serviceRequestModel.addServiceRequest(
            req.body
        );
        await logAudit({
            JobNumber: serviceRequest.JobNumber,
            ActionType: 'Created',
            ChangedBy: req.body.CreatedBy || 'system', // Use logged-in user or system
            Details: `ServiceRequest created. Pump: ${serviceRequest.PumpBrand} ${serviceRequest.PumpModel}, Motor: ${serviceRequest.MotorBrand} ${serviceRequest.MotorModel}`,
        });
        res.status(201).json(serviceRequest);
    } catch (err) {
        next(err);
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
