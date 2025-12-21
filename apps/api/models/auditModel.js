const pool = require('../db');

/**
 * Logs a change event to the audit table.
 * @param {string} actionType - The type of action performed (e.g., 'Update', 'Delete').
 * @param {string|number} changedBy - The ID or name of the user who performed the action.
 * @param {string} details - A descriptive message about the change.
 * @param {string|null} [jobNumber=null] - The optional job number associated with the change.
 * @returns {Promise<void>}
 */
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

/**
 * Retrieves audit logs based on provided filters.
 * @param {Object} filters - Filtering criteria.
 * @param {string} [filters.jobNumber] - Filter logs by a specific job number.
 * @returns {Promise<Array<Object>>} List of audit log entries.
 */
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
