const pool = require('../db');

// Allowed columns for Winding Details to prevent SQL injection
const ALLOWED_COLUMNS = [
    'WireGauge', 'TurnCount', 'CoilWeight', 'ConnectionType',
    'CoreLength', 'CoreDiameter', 'SlotCount', 'Pitch'
];

// Get winding details for a specific job
async function getWindingDetailsByJobNumber(jobNumber) {
    const [rows] = await pool.query(
        `SELECT * FROM windingdetails WHERE JobNumber = ?`,
         [jobNumber]
    );
    // Return single object or null
    return rows.length > 0 ? rows[0] : null;
}

// Upsert winding details (Insert or Update if exists)
async function upsertWindingDetails(data) {
    const { JobNumber, ...details } = data;

    // Filter input data against allowed columns
    const safeDetails = {};
    Object.keys(details).forEach(key => {
        if (ALLOWED_COLUMNS.includes(key)) {
            safeDetails[key] = details[key];
        }
    });

    if (Object.keys(safeDetails).length === 0) {
        return getWindingDetailsByJobNumber(JobNumber);
    }

    const fields = ['JobNumber', ...Object.keys(safeDetails)];
    const placeholders = fields.map(() => '?').join(', ');
    const values = [JobNumber, ...Object.values(safeDetails)];

    // Build ON DUPLICATE KEY UPDATE clause safely using filtered keys
    // Note: VALUES(col_name) is deprecated in MySQL 8.0.20+, using aliases is preferred
    // syntax: INSERT INTO ... VALUES ... AS new_data ON DUPLICATE KEY UPDATE col = new_data.col
    // But for broad compatibility with older MySQL/MariaDB often found in hosting, we stick to VALUES(col) or explicit values.
    // Let's use the standard readable format: col = VALUES(col) which is still widely supported.
    const updateClause = Object.keys(safeDetails)
        .map(field => `${field} = VALUES(${field})`)
        .join(', ');

    await pool.query(
        `INSERT INTO windingdetails (${fields.join(', ')})
         VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        values
    );

    return getWindingDetailsByJobNumber(JobNumber);
}

module.exports = {
    getWindingDetailsByJobNumber,
    upsertWindingDetails
};
