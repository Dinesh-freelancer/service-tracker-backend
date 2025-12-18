const pool = require('../db');

// Get summary by day
async function getDailySummary(date) {
    const [rows] = await pool.query(`
    SELECT
      'Jobs' AS Type,
      COUNT(*) AS Count,
      SUM(IFNULL(BilledAmount, EstimatedAmount)) AS Amount
    FROM servicerequest
    WHERE DATE(DateReceived) = ?
    UNION ALL
    SELECT
      'payments' AS Type,
      COUNT(*) AS Count,
      SUM(Amount) AS Amount
    FROM payments
    WHERE DATE(PaymentDate) = ?
    UNION ALL
    SELECT
      'attendance' AS Type,
      COUNT(*) AS Count,
      NULL AS Amount
    FROM attendance
    WHERE attendanceDate = ?
    UNION ALL
    SELECT
      'partsused' AS Type,
      COUNT(*) AS Count,
      SUM(CostPrice * Qty) AS Amount
    FROM partsused
    WHERE DATE(CreatedAt) = ?
  `, [date, date, date, date]);
    return rows;
}

// Get summary by week (start and end date)
async function getWeeklySummary(startDate, endDate) {
    const [rows] = await pool.query(`
    SELECT
      'Jobs' AS Type,
      COUNT(*) AS Count,
      SUM(IFNULL(BilledAmount, EstimatedAmount)) AS Amount
    FROM servicerequest
    WHERE DateReceived BETWEEN ? AND ?
    UNION ALL
    SELECT
      'payments' AS Type,
      COUNT(*) AS Count,
      SUM(Amount) AS Amount
    FROM payments
    WHERE DATE(PaymentDate) BETWEEN ? AND ?
    UNION ALL
    SELECT
      'attendance' AS Type,
      COUNT(*) AS Count,
      NULL AS Amount
    FROM attendance
    WHERE attendanceDate BETWEEN ? AND ?
    UNION ALL
    SELECT
      'partsused' AS Type,
      COUNT(*) AS Count,
      SUM(CostPrice * Qty) AS Amount
    FROM partsused
    WHERE DATE(CreatedAt) BETWEEN ? AND ?
  `, [startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate]);
    return rows;
}

// Get summary by month (YYYY-MM)
async function getMonthlySummary(yearMonth) {
    const [rows] = await pool.query(`
    SELECT
      'Jobs' AS Type,
      COUNT(*) AS Count,
      SUM(IFNULL(BilledAmount, EstimatedAmount)) AS Amount
    FROM servicerequest
    WHERE DATE_FORMAT(DateReceived, '%Y-%m') = ?
    UNION ALL
    SELECT
      'payments' AS Type,
      COUNT(*) AS Count,
      SUM(Amount) AS Amount
    FROM payments
    WHERE DATE_FORMAT(PaymentDate, '%Y-%m') = ?
    UNION ALL
    SELECT
      'attendance' AS Type,
      COUNT(*) AS Count,
      NULL AS Amount
    FROM attendance
    WHERE DATE_FORMAT(attendanceDate, '%Y-%m') = ?
    UNION ALL
    SELECT
      'partsused' AS Type,
      COUNT(*) AS Count,
      SUM(CostPrice * Qty) AS Amount
    FROM partsused
    WHERE DATE_FORMAT(CreatedAt, '%Y-%m') = ?
  `, [yearMonth, yearMonth, yearMonth, yearMonth]);
    return rows;
}

module.exports = {
    getDailySummary,
    getWeeklySummary,
    getMonthlySummary
};