const technicianReportModel = require('../models/technicianReportModel');

async function workLogSummary(req, res, next) {
    try {
        const summary = await technicianReportModel.getWorkLogSummaryByWorker();
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function attendanceSummary(req, res, next) {
    try {
        const summary = await technicianReportModel.getAttendanceSummaryByWorker();
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function jobCompletionRate(req, res, next) {
    try {
        const summary = await technicianReportModel.getJobCompletionRateByWorker();
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    workLogSummary,
    attendanceSummary,
    jobCompletionRate
};