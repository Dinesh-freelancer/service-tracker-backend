const reportModel = require('../models/reportModel');
const { STRING_HIDDEN } = require('../utils/constants');

// Unfiltered job status summary, supports optional date filtering
async function jobStatusSummary(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { startDate, endDate } = req.query;
        let summary = await reportModel.getJobStatusSummary(startDate, endDate);

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

// Legacy endpoint support (optional: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD)
async function jobStatusSummaryByDate(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        // Still enforce required params if strictly following old contract, but optional now via model
        if (!startDate || !endDate) {
             // For strict backward compatibility, keep returning 400 if missing
            return res.status(400).json({ error: "startDate and endDate are required" });
        }
        const hideSensitive = req.hideSensitive;
        let summary = await reportModel.getJobStatusSummary(startDate, endDate);
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
