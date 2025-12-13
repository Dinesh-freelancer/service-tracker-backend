const workLogModel = require('../models/workLogModel');
const { logAudit } = require('../utils/auditLogger');
const { filterWorkLog, filterWorkLogList } = require('../utils/responseFilter');

/**
 * Lists work logs, optionally filtered by job number and applying sensitive data filtering.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listWorkLogs(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        const jobNumber = req.query.jobNumber || null;
        let logs = await workLogModel.getAllWorkLogs(jobNumber);

        logs = filterWorkLogList(logs, role, hideSensitive);

        res.json(logs);
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieves a single work log entry by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function getWorkLog(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let log = await workLogModel.getWorkLogById(req.params.workLogId);
        if (!log) return res.status(404).json({ error: 'Work log not found' });

        log = filterWorkLog(log, role, hideSensitive);

        res.json(log);
    } catch (err) {
        next(err);
    }
}

/**
 * Creates a new work log entry.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
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