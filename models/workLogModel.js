const pool = require('../db');

// Get all work logs (optionally filter by job)
async function getAllWorkLogs(jobNumber = null) {
    if (jobNumber) {
        const [rows] = await pool.query(
            'SELECT * FROM WorkLog WHERE JobNumber = ? ORDER BY StartTime', [jobNumber]
        );
        return rows;
    } else {
        const [rows] = await pool.query(
            'SELECT * FROM WorkLog ORDER BY StartTime'
        );
        return rows;
    }
}

// Get a single work log entry
async function getWorkLogById(workLogId) {
    const [rows] = await pool.query(
        'SELECT * FROM WorkLog WHERE WorkLogId = ?', [workLogId]
    );
    return rows[0];
}

// Create new work log entry
async function addWorkLog(data) {
    const {
        JobNumber,
        SubStatus,
        WorkDone,
        WorkerId,
        WorkerName,
        StartTime,
        EndTime,
        Notes
    } = data;

    const [result] = await pool.query(
        `INSERT INTO WorkLog (
      JobNumber, SubStatus, WorkDone, WorkerId, WorkerName,
      StartTime, EndTime, Notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            JobNumber,
            SubStatus,
            WorkDone,
            WorkerId,
            WorkerName,
            StartTime,
            EndTime,
            Notes
        ]
    );
    return await getWorkLogById(result.insertId);
}

module.exports = {
    getAllWorkLogs,
    getWorkLogById,
    addWorkLog
};