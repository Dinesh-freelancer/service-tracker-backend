const serviceRequestModel = require('../models/serviceRequestModel');
const { logAudit } = require('../utils/auditLogger');
const { filterServiceRequest, filterServiceRequestList } = require('../utils/responseFilter');

// Get all service requests
async function listServiceRequests(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let serviceRequests = await serviceRequestModel.getAllServiceRequests();

        serviceRequests = filterServiceRequestList(serviceRequests, role, hideSensitive);

        res.json(serviceRequests);
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
            Details: `ServiceRequest created with brand: ${serviceRequest.PumpsetBrand}, model: ${serviceRequest.PumpsetModel}`,
        });
        res.status(201).json(serviceRequest);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listServiceRequests,
    getServiceRequest,
    createServiceRequest,
};