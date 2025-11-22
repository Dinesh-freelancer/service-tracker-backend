const pool = require('../db');

// Get summary of work logs per worker
async function getWorkLogSummaryByWorker() {
    const [rows] = await pool.query(`
    SELECT 
      w.WorkerId,
      w.WorkerName,
      COUNT(wl.WorkLogId) AS TotalWorkLogs,
      SUM(TIMESTAMPDIFF(HOUR, wl.StartTime, wl.EndTime)) AS TotalHoursWorked
    FROM worker w
    LEFT JOIN worklog wl ON w.WorkerId = wl.WorkerId
    GROUP BY w.WorkerId, w.WorkerName
    ORDER BY TotalWorkLogs DESC
  `);
    return rows;
}

// Get attendance summary per worker
async function getAttendanceSummaryByWorker() {
    const [rows] = await pool.query(`
    SELECT 
      w.WorkerId,
      w.WorkerName,
      COUNT(a.AttendanceId) AS TotalDaysPresent,
      SUM(CASE WHEN a.Status = 'Present' THEN 1 ELSE 0 END) AS PresentDays,
      SUM(CASE WHEN a.Status = 'Absent' THEN 1 ELSE 0 END) AS AbsentDays,
      SUM(CASE WHEN a.Status = 'Half Day' THEN 1 ELSE 0 END) AS HalfDays,
      SUM(CASE WHEN a.Status = 'Field Work' THEN 1 ELSE 0 END) AS FieldWorkDays,
      SUM(CASE WHEN a.Status = 'On Leave' THEN 1 ELSE 0 END) AS LeaveDays
    FROM worker w
    LEFT JOIN attendance a ON w.WorkerId = a.WorkerId
    GROUP BY w.WorkerId, w.WorkerName
    ORDER BY TotalDaysPresent DESC
  `);
    return rows;
}

// Get job completion rate per worker
async function getJobCompletionRateByWorker() {
    const [rows] = await pool.query(`
    SELECT 
      w.WorkerId,
      w.WorkerName,
      COUNT(DISTINCT CASE WHEN sr.Status = 'Work Complete' THEN sr.JobNumber END) AS JobsCompleted,
      COUNT(DISTINCT sr.JobNumber) AS TotalJobsAssigned
    FROM worker w
    LEFT JOIN worklog wl ON w.WorkerId = wl.WorkerId
    LEFT JOIN servicerequest sr ON wl.JobNumber = sr.JobNumber
    GROUP BY w.WorkerId, w.WorkerName
    ORDER BY JobsCompleted DESC
  `);
    return rows;
}

module.exports = {
    getWorkLogSummaryByWorker,
    getAttendanceSummaryByWorker,
    getJobCompletionRateByWorker
};