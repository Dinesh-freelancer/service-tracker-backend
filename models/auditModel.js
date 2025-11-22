const pool = require('../db');

// Get all audit logs (optionally filter by JobNumber)
async function getAllAudits(jobNumber = null) {
    if (jobNumber) {
        const [rows] = await pool.query(
            'SELECT * FROM AuditDetails WHERE JobNumber = ? ORDER BY ChangedDateTime DESC', [jobNumber]
        );
        return rows;
    } else {
        const [rows] = await pool.query(
            'SELECT * FROM AuditDetails ORDER BY ChangedDateTime DESC'
        );
        return rows;
    }
}

// Add a new audit entry
async function addAudit(data) {
    const {
        JobNumber,
        ChangedDateTime,
        ActionType,
        ChangedBy,
        Details
    } = data;

    const [result] = await pool.query(
        `INSERT INTO AuditDetails (
      JobNumber, ChangedDateTime, ActionType, ChangedBy, Details
    ) VALUES (?, ?, ?, ?, ?)`, [
            JobNumber,
            ChangedDateTime || new Date(),
            ActionType,
            ChangedBy,
            Details
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllAudits,
    addAudit
};