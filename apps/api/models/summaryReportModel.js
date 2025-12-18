const pool = require('../db');

// Get daily summary
async function getDailySummary(date, hideSensitive) {
    // This would ideally query a pre-calculated SummaryReports table or aggregate on the fly
    // For now, on-the-fly aggregation placeholder

    // Example: Count jobs received today
    const [jobs] = await pool.query(
        `SELECT Status, COUNT(*) AS count
         FROM servicerequest
         WHERE DATE(DateReceived) = ?
         GROUP BY Status`,
        [date]
    );

    // Payments
    const [payments] = await pool.query(
        `SELECT SUM(Amount) as total
         FROM payments
         WHERE DATE(PaymentDate) = ?`,
        [date]
    );

    return {
        date,
        jobs: jobs,
        totalPayments: payments[0].total || 0
    };
}

async function getWeeklySummary(startDate, endDate, hideSensitive) {
     const [jobs] = await pool.query(
        `SELECT Status, COUNT(*) AS count
         FROM servicerequest
         WHERE DateReceived BETWEEN ? AND ?
         GROUP BY Status`,
        [startDate, endDate]
    );
    return { startDate, endDate, jobs };
}

async function getMonthlySummary(yearMonth, hideSensitive) {
    // yearMonth format 'YYYY-MM'
    const [jobs] = await pool.query(
        `SELECT Status, COUNT(*) AS count
         FROM servicerequest
         WHERE DATE_FORMAT(DateReceived, '%Y-%m') = ?
         GROUP BY Status`,
        [yearMonth]
    );
    return { yearMonth, jobs };
}

module.exports = {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary
};
