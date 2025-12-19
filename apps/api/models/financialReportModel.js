const pool = require('../db');

// Total paid and outstanding per job
async function getFinancialSummaryAllJobs() {
    const [rows] = await pool.query(`
    SELECT sr.JobNumber,
           sr.CustomerId,
           sr.PumpBrand,
           sr.PumpModel,
           sr.MotorBrand,
           sr.MotorModel,
           IFNULL(SUM(p.Amount), 0) AS TotalPaid,
           IFNULL(sr.EstimatedAmount, 0) AS EstimatedAmount,
           IFNULL(sr.BilledAmount, 0) AS BilledAmount,
           (IFNULL(sr.BilledAmount, sr.EstimatedAmount) - IFNULL(SUM(p.Amount), 0)) AS Outstanding
      FROM servicerequest sr
 LEFT JOIN payments p ON sr.JobNumber = p.JobNumber
  GROUP BY sr.JobNumber, sr.CustomerId, sr.PumpBrand, sr.PumpModel, sr.MotorBrand, sr.MotorModel, sr.EstimatedAmount, sr.BilledAmount
  ORDER BY sr.JobNumber DESC
  `);
    return rows;
}

// Payments received, outstanding for a specific customer
async function getFinancialSummaryByCustomer(customerId) {
    const [rows] = await pool.query(`
    SELECT sr.JobNumber,
           sr.PumpBrand,
           sr.PumpModel,
           sr.MotorBrand,
           sr.MotorModel,
           IFNULL(SUM(p.Amount), 0) AS TotalPaid,
           IFNULL(sr.BilledAmount, sr.EstimatedAmount) AS TotalDue,
           (IFNULL(sr.BilledAmount, sr.EstimatedAmount) - IFNULL(SUM(p.Amount), 0)) AS Outstanding
      FROM servicerequest sr
 LEFT JOIN payments p ON sr.JobNumber = p.JobNumber
     WHERE sr.CustomerId = ?
  GROUP BY sr.JobNumber, sr.PumpBrand, sr.PumpModel, sr.MotorBrand, sr.MotorModel, sr.BilledAmount, sr.EstimatedAmount
  ORDER BY sr.JobNumber DESC
  `, [customerId]);
    return rows;
}

// Aggregate totals for dashboard
async function getFinancialTotals() {
    const [rows] = await pool.query(`
    SELECT
      COUNT(DISTINCT sr.JobNumber) AS TotalJobs,
      IFNULL(SUM(p.Amount), 0) AS TotalPaymentsReceived,
      IFNULL(SUM(sr.BilledAmount), SUM(sr.EstimatedAmount)) AS TotalAmountBilled,
      (IFNULL(SUM(sr.BilledAmount), SUM(sr.EstimatedAmount)) - IFNULL(SUM(p.Amount), 0)) AS TotalOutstanding
    FROM servicerequest sr
    LEFT JOIN payments p ON sr.JobNumber = p.JobNumber
  `);
    return rows[0];
}

module.exports = {
    getFinancialSummaryAllJobs,
    getFinancialSummaryByCustomer,
    getFinancialTotals
};