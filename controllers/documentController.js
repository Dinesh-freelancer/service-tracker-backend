const documentModel = require('../models/documentModel');
const { logAudit } = require('../utils/auditLogger');

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
        const docs = await documentModel.getDocumentsByJob(req.params.jobNumber);
        res.json(docs);
    } catch (err) {
        next(err);
    }
}

async function getDocumentsByCustomer(req, res, next) {
    try {
        const docs = await documentModel.getDocumentsByCustomer(req.params.customerId);
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