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
           COALESCE(p_agg.TotalPaid, 0) AS TotalPaid,
           COALESCE(pu_agg.TotalPartsCost, 0) AS PartsCost,
           COALESCE(sr.EstimatedAmount, 0) AS EstimatedAmount,
           COALESCE(sr.BilledAmount, 0) AS BilledAmount,
           (COALESCE(sr.BilledAmount, sr.EstimatedAmount, 0) - COALESCE(p_agg.TotalPaid, 0)) AS Outstanding,
           (COALESCE(sr.BilledAmount, 0) - COALESCE(pu_agg.TotalPartsCost, 0)) AS Profit,
           sr.DateReceived
      FROM servicerequest sr
 LEFT JOIN (
        SELECT JobNumber, SUM(Amount) as TotalPaid
        FROM payments
        GROUP BY JobNumber
    ) p_agg ON sr.JobNumber = p_agg.JobNumber
 LEFT JOIN (
        SELECT JobNumber, SUM(CostPrice * Qty) as TotalPartsCost
        FROM partsused
        GROUP BY JobNumber
    ) pu_agg ON sr.JobNumber = pu_agg.JobNumber
 LEFT JOIN customerdetails c ON sr.CustomerId = c.CustomerId
     WHERE 1=1 ${clause}
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
      (SUM(COALESCE(sr.BilledAmount, sr.EstimatedAmount, 0)) - COALESCE(SUM(p_agg.TotalPaid), 0)) AS TotalOutstanding,
      COALESCE(SUM(pu_agg.TotalPartsCost), 0) AS TotalPartsCost,
      (SUM(COALESCE(sr.BilledAmount, 0)) - COALESCE(SUM(pu_agg.TotalPartsCost), 0)) AS GrossProfit
    FROM servicerequest sr
    LEFT JOIN (
        SELECT JobNumber, SUM(Amount) as TotalPaid
        FROM payments
        GROUP BY JobNumber
    ) p_agg ON sr.JobNumber = p_agg.JobNumber
    LEFT JOIN (
        SELECT JobNumber, SUM(CostPrice * Qty) as TotalPartsCost
        FROM partsused
        GROUP BY JobNumber
    ) pu_agg ON sr.JobNumber = pu_agg.JobNumber
    WHERE 1=1 ${clause}
  `;

    const [rows] = await pool.query(sql, params);
    return rows[0];
}


async function getPurchasesVsRevenue(startDate, endDate) {
    const params = [];
    let paymentDateClause = '';
    let purchaseDateClause = '';

    if (startDate && endDate) {
        paymentDateClause = 'WHERE PaymentDate BETWEEN ? AND ?';
        purchaseDateClause = 'WHERE PurchaseDate BETWEEN ? AND ?';
        params.push(startDate, endDate, startDate, endDate);
    } else if (startDate) {
        paymentDateClause = 'WHERE PaymentDate >= ?';
        purchaseDateClause = 'WHERE PurchaseDate >= ?';
        params.push(startDate, startDate);
    } else if (endDate) {
        paymentDateClause = 'WHERE PaymentDate <= ?';
        purchaseDateClause = 'WHERE PurchaseDate <= ?';
        params.push(endDate, endDate);
    }

    const sql = `
        SELECT
            DATE_FORMAT(DateObj, '%Y-%m') as Month,
            SUM(Revenue) as Revenue,
            SUM(Purchases) as Purchases
        FROM (
            SELECT PaymentDate as DateObj, Amount as Revenue, 0 as Purchases
            FROM payments
            ${paymentDateClause}
            UNION ALL
            SELECT p.PurchaseDate as DateObj, 0 as Revenue, COALESCE(SUM(pi.TotalPrice), 0) as Purchases
            FROM purchases p
            LEFT JOIN purchaseitems pi ON p.PurchaseId = pi.PurchaseId
            ${purchaseDateClause}
            GROUP BY p.PurchaseId
        ) combined
        GROUP BY Month
        ORDER BY Month ASC
    `;

    const [rows] = await pool.query(sql, params);
    return rows;
}

module.exports = {
    getPurchasesVsRevenue,
    getFinancialSummaryAllJobs,
    getFinancialSummaryByCustomer,
    getFinancialTotals
};
