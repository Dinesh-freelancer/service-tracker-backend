const summaryReportModel = require('../models/summaryReportModel');

async function dailySummary(req, res, next) {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: "date is required" });
        }
        const summary = await summaryReportModel.getDailySummary(date);
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function weeklySummary(req, res, next) {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: "startDate and endDate are required" });
        }
        const summary = await summaryReportModel.getWeeklySummary(startDate, endDate);
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function monthlySummary(req, res, next) {
    try {
        const { yearMonth } = req.query;
        if (!yearMonth) {
            return res.status(400).json({ error: "yearMonth (YYYY-MM) is required" });
        }
        const summary = await summaryReportModel.getMonthlySummary(yearMonth);
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