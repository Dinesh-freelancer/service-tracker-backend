const documentModel = require('../models/documentModel');
const { logAudit } = require('../utils/auditLogger');
const { filterDocumentList } = require('../utils/responseFilter');

async function createDocument(req, res, next) {
    try {
        const data = req.body;
        data.CreatedBy = req.user.UserId;
        const doc = await documentModel.addDocument(data);
        await logAudit({
            ActionType: 'Document Created',
            ChangedBy: req.user.UserId,
            Details: `Document ID ${doc.DocumentId} created for Job ${doc.JobNumber || 'N/A'}`
        });

        res.status(201).json(doc);
    } catch (err) {
        next(err);
    }
}

async function getDocumentsByJob(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let docs = await documentModel.getDocumentsByJob(req.params.jobNumber);

        docs = filterDocumentList(docs, role, hideSensitive);

        res.json(docs);
    } catch (err) {
        next(err);
    }
}

async function getDocumentsByCustomer(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let docs = await documentModel.getDocumentsByCustomer(req.params.customerId);

        // Even for getDocumentsByCustomer, we should apply filtering if the requester is constrained
        // (though usually this endpoint is for Admins or the Customer themselves).
        // If it's the customer, filterDocumentList (via filterDocument) generally passes it through
        // unless specific logic for Customers is added.
        docs = filterDocumentList(docs, role, hideSensitive);

        res.json(docs);
    } catch (err) {
        next(err);
    }
}

async function deleteDocument(req, res, next) {
    try {
        await documentModel.deleteDocument(req.params.id);

        await logAudit({
            ActionType: 'Document Deleted',
            ChangedBy: req.user.UserId,
            Details: `Document ID ${req.params.id} deleted`
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createDocument,
    getDocumentsByJob,
    getDocumentsByCustomer,
    deleteDocument
};