const pool = require('../db');

// Get technician performance report
async function getTechnicianPerformance(workerId, dateFrom, dateTo) {
    let query = `
    SELECT 
      w.WorkerName,
      COUNT(sr.JobNumber) as JobsCompleted,
      AVG(DATEDIFF(sr.CompletionDate, sr.DateReceived)) as AvgTurnaroundDays
    FROM worker w
    LEFT JOIN servicerequest sr ON w.WorkerId = sr.AssignedWorkerId
    WHERE sr.Status = 'Completed'
  `;
    let params = [];

    if (workerId) {
        query += ' AND w.WorkerId = ?';
        params.push(workerId);
    }

    // Date filters on CompletionDate
    if (dateFrom) {
        query += ' AND sr.CompletionDate >= ?';
        params.push(dateFrom);
    }
    if (dateTo) {
         query += ' AND sr.CompletionDate <= ?';
         params.push(dateTo);
    }

    query += ' GROUP BY w.WorkerId';

    const [rows] = await pool.query(query, params);
    return rows;
}

module.exports = {
    getTechnicianPerformance
};
