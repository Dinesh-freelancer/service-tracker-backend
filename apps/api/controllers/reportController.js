const reportModel = require('../models/reportModel');
const { STRING_HIDDEN } = require('../utils/constants');

// Unfiltered job status summary
async function jobStatusSummary(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let summary = await reportModel.getJobStatusSummary();
        if (hideSensitive) {
            summary = summary.map(item => ({
                "Status": item.Status,
                "count": STRING_HIDDEN
            }));
        }
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
        const hideSensitive = req.hideSensitive;
        let summary = await reportModel.getJobStatusSummaryByDate(startDate, endDate);
        if(hideSensitive){
            summary = summary.map(item => ({
                "Status": item.Status,
                "count": STRING_HIDDEN
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    jobStatusSummary,
    jobStatusSummaryByDate
};