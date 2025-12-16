const summaryReportModel = require('../models/summaryReportModel');
const { STRING_HIDDEN } = require('../utils/constants');

async function dailySummary(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "date is required" });
        }
        let summary = await summaryReportModel.getDailySummary(date);
        if (hideSensitive) {
            summary = summary.map(item => ({
                "Type": item.Type,
                "Count": STRING_HIDDEN,
                "Amount": STRING_HIDDEN
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function weeklySummary(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "startDate and endDate are required" });
        }
        let summary = await summaryReportModel.getWeeklySummary(startDate, endDate);
        if (hideSensitive) {
            summary = summary.map(item => ({
                "Type": item.Type,
                "Count": STRING_HIDDEN,
                "Amount": STRING_HIDDEN
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function monthlySummary(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { yearMonth } = req.query;
        if (!yearMonth) {
            return res.status(400).json({ error: "yearMonth (YYYY-MM) is required" });
        }
        let summary = await summaryReportModel.getMonthlySummary(yearMonth);
        if (hideSensitive) {
            summary = summary.map(item => ({
                "Type": item.Type,
                "Count": STRING_HIDDEN,
                "Amount": STRING_HIDDEN
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    dailySummary,
    weeklySummary,
    monthlySummary
};