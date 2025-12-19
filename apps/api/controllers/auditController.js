const auditModel = require('../models/auditModel');

// List audits (optionally by job)
async function listAudits(req, res, next) {
    try {
        const jobNumber = req.query.jobNumber || null;
        const audits = await auditModel.getAllAudits(jobNumber);
        res.json(audits);
    } catch (err) {
        next(err);
    }
}

// Add audit entry
async function createAudit(req, res, next) {
    try {
        const auditId = await auditModel.addAudit(req.body);
        res.status(201).json({ AuditId: auditId });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listAudits,
    createAudit
};