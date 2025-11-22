const financialReportModel = require('../models/financialReportModel');

async function summaryAllJobs(req, res, next) {
    try {
        const summary = await financialReportModel.getFinancialSummaryAllJobs();
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function summaryByCustomer(req, res, next) {
    try {
        const { customerId } = req.params;
        const summary = await financialReportModel.getFinancialSummaryByCustomer(customerId);
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function financialTotals(req, res, next) {
    try {
        const totals = await financialReportModel.getFinancialTotals();
        res.json(totals);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    summaryAllJobs,
    summaryByCustomer,
    financialTotals
};