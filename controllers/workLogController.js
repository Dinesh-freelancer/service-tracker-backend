const workLogModel = require('../models/workLogModel');
const { logAudit } = require('../utils/auditLogger');

// List work logs (optionally filter by job number)
async function listWorkLogs(req, res, next) {
    try {
        const jobNumber = req.query.jobNumber || null;
        const logs = await workLogModel.getAllWorkLogs(jobNumber);
        res.json(logs);
    } catch (err) {
        next(err);
    }
}

// Get a work log by ID
async function getWorkLog(req, res, next) {
    try {
        const log = await workLogModel.getWorkLogById(req.params.workLogId);
        if (!log) return res.status(404).json({ error: 'Work log not found' });
        res.json(log);
    } catch (err) {
        next(err);
    }
}

// Add a work log entry
async function createWorkLog(req, res, next) {
    try {
        const log = await workLogModel.addWorkLog(req.body);
        await logAudit({
            JobNumber: log.JobNumber,
            ActionType: 'WorkLog Created',
            ChangedBy: req.body.WorkerName || 'system',
            Details: `Added work log ${log.SubStatus} for job ${log.JobNumber} by ${log.WorkerName}`
        });
        res.status(201).json(log);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listWorkLogs,
    getWorkLog,
    createWorkLog
};