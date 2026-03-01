const pool = require('../db');

// Helper to build date clause
function buildDateClause(startDate, endDate) {
    let clause = '';
    const params = [];
    if (startDate && endDate) {
        clause = ' AND sr.DateReceived BETWEEN ? AND ?';
        params.push(startDate, endDate);
    } else if (startDate) {
        clause = ' AND sr.DateReceived >= ?';
        params.push(startDate);
    } else if (endDate) {
        clause = ' AND sr.DateReceived <= ?';
        params.push(endDate);
    }
    return { clause, params };
}

// Total paid and outstanding per job
async function getFinancialSummaryAllJobs(startDate, endDate) {
    const { clause, params } = buildDateClause(startDate, endDate);

    // We use a subquery for payments to be safe, though GROUP BY JobNumber usually handles it for per-job rows.
    // However, keeping the LEFT JOIN p approach with GROUP BY is standard for this specific "per job" query.
    // But let's be consistent with the Totals fix and use the subquery approach to avoid any "multiplying" effects if we add more joins later.
    // actually, for this specific query, the simple LEFT JOIN + GROUP BY is fine because we group by the unique key (JobNumber).
    // The issue in 'Totals' was summing a column that wasn't unique in the joined set.

    const sql = `
    SELECT sr.JobNumber,
           sr.CustomerId,
           c.CustomerName,
           sr.PumpBrand,
           sr.PumpModel,
           sr.MotorBrand,
           sr.MotorModel,
           COALESCE(SUM(p.Amount), 0) AS TotalPaid,
           COALESCE(sr.EstimatedAmount, 0) AS EstimatedAmount,
           COALESCE(sr.BilledAmount, 0) AS BilledAmount,
           (COALESCE(sr.BilledAmount, sr.EstimatedAmount, 0) - COALESCE(SUM(p.Amount), 0)) AS Outstanding,
           sr.DateReceived
      FROM servicerequest sr
 LEFT JOIN payments p ON sr.JobNumber = p.JobNumber
 LEFT JOIN customerdetails c ON sr.CustomerId = c.CustomerId
     WHERE 1=1 ${clause}
  GROUP BY sr.JobNumber
  ORDER BY sr.JobNumber DESC
  `;

    const [rows] = await pool.query(sql, params);
    return rows;
}

// payments received, outstanding for a specific customer
async function getFinancialSummaryByCustomer(customerId, startDate, endDate) {
    const { clause, params } = buildDateClause(startDate, endDate);
    const sqlParams = [customerId, ...params];

    const sql = `
    SELECT sr.JobNumber,
           sr.PumpBrand,
           sr.PumpModel,
           sr.MotorBrand,
           sr.MotorModel,
           COALESCE(SUM(p.Amount), 0) AS TotalPaid,
           COALESCE(sr.BilledAmount, sr.EstimatedAmount, 0) AS TotalDue,
           (COALESCE(sr.BilledAmount, sr.EstimatedAmount, 0) - COALESCE(SUM(p.Amount), 0)) AS Outstanding,
           sr.DateReceived
      FROM servicerequest sr
 LEFT JOIN payments p ON sr.JobNumber = p.JobNumber
     WHERE sr.CustomerId = ? ${clause}
  GROUP BY sr.JobNumber
  ORDER BY sr.JobNumber DESC
  `;

    const [rows] = await pool.query(sql, sqlParams);
    return rows;
}

// Aggregate totals for dashboard (Fixed logic)
async function getFinancialTotals(startDate, endDate) {
    const { clause, params } = buildDateClause(startDate, endDate);

    // Using a derived table (subquery) for payments to ensure 1:1 join with servicerequest
    const sql = `
    SELECT
      COUNT(sr.JobNumber) AS TotalJobs,
      COALESCE(SUM(p_agg.TotalPaid), 0) AS TotalPaymentsReceived,
      SUM(COALESCE(sr.BilledAmount, sr.EstimatedAmount, 0)) AS TotalAmountBilled,
      (SUM(COALESCE(sr.BilledAmount, sr.EstimatedAmount, 0)) - COALESCE(SUM(p_agg.TotalPaid), 0)) AS TotalOutstanding
    FROM servicerequest sr
    LEFT JOIN (
        SELECT JobNumber, SUM(Amount) as TotalPaid
        FROM payments
        GROUP BY JobNumber
    ) p_agg ON sr.JobNumber = p_agg.JobNumber
    WHERE 1=1 ${clause}
  `;

    const [rows] = await pool.query(sql, params);
    return rows[0];
}

module.exports = {
    getFinancialSummaryAllJobs,
    getFinancialSummaryByCustomer,
    getFinancialTotals
};
