const workLogModel = require('../models/workLogModel');
const { logAudit } = require('../utils/auditLogger');
const { filterWorkLog, filterWorkLogList } = require('../utils/responseFilter');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');
const NotificationService = require('../utils/notificationService');

/**
 * Lists work logs with pagination, optionally filtered by job number.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listWorkLogs(req, res, next) {
    try {
        const role = req.user ? req.user.Role : null;
        const jobNumber = req.query.jobNumber || null;
        const { page, limit, offset } = getPagination(req);

        const { rows, totalCount } = await workLogModel.getAllWorkLogs(jobNumber, limit, offset);

        const filteredLogs = filterWorkLogList(rows, role);
        const response = getPaginationData(filteredLogs, page, limit, totalCount);

        res.json(response);
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
        const role = req.user ? req.user.Role : null;
        let log = await workLogModel.getWorkLogById(req.params.workLogId);
        if (!log) return res.status(404).json({ error: 'Work log not found' });

        log = filterWorkLog(log, role);

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

        // Notify Assigned Worker
        if (req.body.AssignedWorker) {
            await NotificationService.notifyAssignedWorker(
                req.body.AssignedWorker,
                'JobAssignment',
                'New Job Assignment',
                `You have been assigned to job ${log.JobNumber} (${req.body.SubStatus})`,
                log.JobNumber
            );
        }

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
