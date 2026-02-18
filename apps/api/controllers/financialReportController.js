const financialReportModel = require('../models/financialReportModel');
const { STRING_HIDDEN } = require('../utils/constants');

async function summaryAllJobs(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { startDate, endDate } = req.query;
        let summary = await financialReportModel.getFinancialSummaryAllJobs(startDate, endDate);

        if (hideSensitive) {
            summary = summary.map(reportDetail => ({
                "JobNumber": reportDetail.JobNumber,
                "CustomerId": STRING_HIDDEN,
                "CustomerName": STRING_HIDDEN,
                "PumpBrand": STRING_HIDDEN,
                "PumpModel": STRING_HIDDEN,
                "MotorBrand": STRING_HIDDEN,
                "MotorModel": STRING_HIDDEN,
                "TotalPaid": STRING_HIDDEN,
                "EstimatedAmount": STRING_HIDDEN,
                "BilledAmount": STRING_HIDDEN,
                "Outstanding": STRING_HIDDEN,
                "DateReceived": reportDetail.DateReceived
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function summaryByCustomer(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { customerId } = req.params;
        const { startDate, endDate } = req.query;

        let summary = await financialReportModel.getFinancialSummaryByCustomer(customerId, startDate, endDate);

        if (hideSensitive) {
            summary = summary.map(reportDetail => ({
                "JobNumber": reportDetail.JobNumber,
                "PumpsetBrand": STRING_HIDDEN,
                "PumpsetModel": STRING_HIDDEN,
                "TotalPaid": STRING_HIDDEN,
                "TotalDue": STRING_HIDDEN,
                "Outstanding": STRING_HIDDEN,
                "DateReceived": reportDetail.DateReceived
            }));
        }
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

async function financialTotals(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { startDate, endDate } = req.query;

        let totals = await financialReportModel.getFinancialTotals(startDate, endDate);

        if (hideSensitive) {
            totals = {
                "TotalJobs": STRING_HIDDEN,
                "TotalPaymentsReceived": STRING_HIDDEN,
                "TotalAmountBilled": STRING_HIDDEN,
                "TotalOutstanding": STRING_HIDDEN
            };
        }
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
