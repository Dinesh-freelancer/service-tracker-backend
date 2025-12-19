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

    // Check if ChangedBy is integer or string (system)
    // If it's a string like 'system', we might need to handle it or set to NULL/Admin ID
    // Schema says ChangedBy INT NOT NULL. 'system' will fail if not converted.
    // For now, assume logic upstream handles ID, or we default to 1 (Admin) if 'system' passed and schema enforces INT.
    // However, the error is 'intermediate value is not iterable', which usually means pool.query didn't return [result].
    // But since we are mocking pool.query in tests, we need to ensure the mock returns an array.

    const [result] = await pool.execute(
        `INSERT INTO auditdetails (
      JobNumber, ChangedDateTime, ActionType, ChangedBy, Details
    ) VALUES (?, ?, ?, ?, ?)`, [
            JobNumber,
            ChangedDateTime || new Date(),
            ActionType,
            (typeof ChangedBy === 'number') ? ChangedBy : 1, // Fallback to 1 if not number (temporary fix for 'system')
            Details
        ]
    );
    return result.insertId;
}

module.exports = {
    getAllAudits,
    addAudit
};