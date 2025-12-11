const workLogModel = require('../models/workLogModel');
const { logAudit } = require('../utils/auditLogger');
const { STRING_HIDDEN } = require('../utils/constants');

// List work logs (optionally filter by job number)
async function listWorkLogs(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const jobNumber = req.query.jobNumber || null;
        let logs = await workLogModel.getAllWorkLogs(jobNumber);
        if (hideSensitive) {
            logs = logs.map(item => ({
                "WorkLogId": item.WorkLogId,
                "JobNumber": STRING_HIDDEN,
                "SubStatus": STRING_HIDDEN,
                "WorkerId": STRING_HIDDEN,
                "WorkDone": STRING_HIDDEN,
                "WorkerName": STRING_HIDDEN,
                "StartTime": STRING_HIDDEN,
                "EndTime": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "WorkDate": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            }));
        }
        res.json(logs);
    } catch (err) {
        next(err);
    }
}

// Get a work log by ID
async function getWorkLog(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let log = await workLogModel.getWorkLogById(req.params.workLogId);
        if (!log) return res.status(404).json({ error: 'Work log not found' });
        if(hideSensitive){
            log = {
                "WorkLogId": log.WorkLogId,
                "JobNumber": STRING_HIDDEN,
                "SubStatus": STRING_HIDDEN,
                "WorkerId": STRING_HIDDEN,
                "WorkDone": STRING_HIDDEN,
                "WorkerName": STRING_HIDDEN,
                "StartTime": STRING_HIDDEN,
                "EndTime": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "WorkDate": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            };
        }
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