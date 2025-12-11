const serviceRequestModel = require('../models/serviceRequestModel');
const { logAudit } = require('../utils/auditLogger');
const { STRING_HIDDEN } = require('../utils/constants');

// Get all service requests
async function listServiceRequests(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let serviceRequests = await serviceRequestModel.getAllServiceRequests();
        if (hideSensitive) {
            serviceRequests = serviceRequests.map(item => ({
                "JobNumber": item.JobNumber,
                "CustomerId": STRING_HIDDEN,
                "PumpsetBrand": STRING_HIDDEN,
                "PumpsetModel": STRING_HIDDEN,
                "HP": STRING_HIDDEN,
                "Warranty": STRING_HIDDEN,
                "SerialNumber": STRING_HIDDEN,
                "DateReceived": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "Status": STRING_HIDDEN,
                "EstimationDate": STRING_HIDDEN,
                "EstimateLink": STRING_HIDDEN,
                "EstimatedAmount": STRING_HIDDEN,
                "BilledAmount": STRING_HIDDEN,
                "ApprovalDate": STRING_HIDDEN,
                "DeclinedReason": STRING_HIDDEN,
                "DeclinedNotes": STRING_HIDDEN,
                "WorkStartDate": STRING_HIDDEN,
                "WorkEndDate": STRING_HIDDEN,
                "InvoiceLink": STRING_HIDDEN,
                "DeliveryDate": STRING_HIDDEN,
                "DeliveryNotes": STRING_HIDDEN,
                "ReturnDate": STRING_HIDDEN,
                "ReturnNotes": STRING_HIDDEN,
                "ClosureDate": STRING_HIDDEN,
                "ClosureNotes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN,
                "EnquiryId": STRING_HIDDEN
            }));
        }
        res.json(serviceRequests);
    } catch (err) {
        next(err);
    }
}

// Get by job number
async function getServiceRequest(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let serviceRequest =
            await serviceRequestModel.getServiceRequestByJobNumber(
                req.params.jobNumber
            );
        if (!serviceRequest)
            return res.status(404).json({ error: 'Service request not found' });
        if(hideSensitive){
            serviceRequest={
                 "JobNumber": serviceRequest.JobNumber,
                "CustomerId": STRING_HIDDEN,
                "PumpsetBrand": STRING_HIDDEN,
                "PumpsetModel": STRING_HIDDEN,
                "HP": STRING_HIDDEN,
                "Warranty": STRING_HIDDEN,
                "SerialNumber": STRING_HIDDEN,
                "DateReceived": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "Status": STRING_HIDDEN,
                "EstimationDate": STRING_HIDDEN,
                "EstimateLink": STRING_HIDDEN,
                "EstimatedAmount": STRING_HIDDEN,
                "BilledAmount": STRING_HIDDEN,
                "ApprovalDate": STRING_HIDDEN,
                "DeclinedReason": STRING_HIDDEN,
                "DeclinedNotes": STRING_HIDDEN,
                "WorkStartDate": STRING_HIDDEN,
                "WorkEndDate": STRING_HIDDEN,
                "InvoiceLink": STRING_HIDDEN,
                "DeliveryDate": STRING_HIDDEN,
                "DeliveryNotes": STRING_HIDDEN,
                "ReturnDate": STRING_HIDDEN,
                "ReturnNotes": STRING_HIDDEN,
                "ClosureDate": STRING_HIDDEN,
                "ClosureNotes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN,
                "EnquiryId": STRING_HIDDEN
            };
        }
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