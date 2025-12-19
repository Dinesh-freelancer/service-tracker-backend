const pool = require('../db');

// Log an audit entry
async function logChange(actionType, changedBy, details, jobNumber = null) {
    try {
        await pool.query(
            `INSERT INTO auditdetails (ActionType, ChangedBy, Details, JobNumber)
             VALUES (?, ?, ?, ?)`,
            [actionType, changedBy, details, jobNumber]
        );
    } catch (error) {
        console.error('Audit Log Error:', error);
        // Don't throw, we don't want to break the main action if audit fails
    }
}

// Get audit logs
async function getAuditLogs(filters) {
    let query = 'SELECT * FROM auditdetails ORDER BY ChangedDateTime DESC';
    let params = [];

    // Check if we need to filter by JobNumber specifically
    if (filters.jobNumber) {
         query = 'SELECT * FROM auditdetails WHERE JobNumber = ? ORDER BY ChangedDateTime DESC';
         params = [filters.jobNumber];
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

module.exports = {
    logChange,
    getAuditLogs
};
