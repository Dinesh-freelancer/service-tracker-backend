const technicianReportModel = require('../models/technicianReportModel');
const { STRING_HIDDEN } = require('../utils/constants');

/**
 * Retrieves a summary of work logs for technicians.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function workLogSummary(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let summary = await technicianReportModel.getWorkLogSummaryByWorker();
        if (hideSensitive) {
            summary = summary.map(item => ({
                "WorkerId": item.WorkerId,
                "WorkerName": STRING_HIDDEN,
                "TotalWorkLogs": STRING_HIDDEN,
                "TotalHoursWorked": STRING_HIDDEN
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieves an attendance summary for technicians.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function attendanceSummary(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let summary = await technicianReportModel.getAttendanceSummaryByWorker();
        if (hideSensitive) {
            summary = summary.map(item => ({
                "WorkerId": item.WorkerId,
                "WorkerName": STRING_HIDDEN,
                "TotalDaysPresent": STRING_HIDDEN,
                "PresentDays": STRING_HIDDEN,
                "AbsentDays": STRING_HIDDEN,
                "HalfDays": STRING_HIDDEN,
                "FieldWorkDays": STRING_HIDDEN,
                "LeaveDays": STRING_HIDDEN
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieves the job completion rate for technicians.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
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