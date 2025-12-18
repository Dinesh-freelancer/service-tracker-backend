const pool = require('../db');

// Get summary of work logs per worker
async function getworklogSummaryByworker() {
    const [rows] = await pool.query(`
    SELECT 
      w.workerId,
      w.workerName,
      COUNT(wl.worklogId) AS Totalworklogs,
      SUM(TIMESTAMPDIFF(HOUR, wl.StartTime, wl.EndTime)) AS TotalHoursWorked
    FROM worker w
    LEFT JOIN worklog wl ON w.workerId = wl.workerId
    GROUP BY w.workerId, w.workerName
    ORDER BY Totalworklogs DESC
  `);
    return rows;
}

// Get attendance summary per worker
async function getattendanceSummaryByworker() {
    const [rows] = await pool.query(`
    SELECT 
      w.workerId,
      w.workerName,
      COUNT(a.attendanceId) AS TotalDaysPresent,
      SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) AS PresentDays,
      SUM(CASE WHEN a.Status = 'Absent' THEN 1 ELSE 0 END) AS AbsentDays,
      SUM(CASE WHEN a.Status = 'Half Day' THEN 1 ELSE 0 END) AS HalfDays,
      SUM(CASE WHEN a.Status = 'Field Work' THEN 1 ELSE 0 END) AS FieldWorkDays,
      SUM(CASE WHEN a.Status = 'On Leave' THEN 1 ELSE 0 END) AS LeaveDays
    FROM worker w
    LEFT JOIN attendance a ON w.workerId = a.workerId
    GROUP BY w.workerId, w.workerName
    ORDER BY TotalDaysPresent DESC
  `);
    return rows;
}

// Get job completion rate per worker
async function getJobCompletionRateByworker() {
    const [rows] = await pool.query(`
    SELECT 
      w.workerId,
      w.workerName,
      COUNT(DISTINCT CASE WHEN sr.Status = 'Work Complete' THEN sr.JobNumber END) AS JobsCompleted,
      COUNT(DISTINCT sr.JobNumber) AS TotalJobsAssigned
    FROM worker w
    LEFT JOIN worklog wl ON w.workerId = wl.workerId
    LEFT JOIN servicerequest sr ON wl.JobNumber = sr.JobNumber
    GROUP BY w.workerId, w.workerName
    ORDER BY JobsCompleted DESC
  `);
    return rows;
}

module.exports = {
    getworklogSummaryByworker,
    getattendanceSummaryByworker,
    getJobCompletionRateByworker
};