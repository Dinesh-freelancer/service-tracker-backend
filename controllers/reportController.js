const reportModel = require('../models/reportModel');

// Unfiltered job status summary
async function jobStatusSummary(req, res, next) {
    try {
        const summary = await reportModel.getJobStatusSummary();
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

// Date-filtered summary (optional: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
async function jobStatusSummaryByDate(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "startDate and endDate are required" });
        }
        const summary = await reportModel.getJobStatusSummaryByDate(startDate, endDate);
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    jobStatusSummary,
    jobStatusSummaryByDate
};