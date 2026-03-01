const pool = require('../db');

// Allowed columns for Winding Details based on new DDL
const ALLOWED_COLUMNS = [
    'assetId', 'hp', 'kw', 'phase', 'connection_type',
    'swg_run', 'swg_start', 'swg_3phase',
    'wire_id_run', 'wire_od_run',
    'wire_id_start', 'wire_od_start',
    'wire_id_3phase', 'wire_od_3phase',
    'turns_run', 'turns_start', 'turns_3phase',
    'slot_turns_run', 'slot_turns_start', 'slot_turns_3phase',
    'notes'
];

// JSON fields that need stringification before DB insert
const JSON_COLUMNS = ['slot_turns_run', 'slot_turns_start', 'slot_turns_3phase'];

// Get winding details for a specific asset
async function getWindingDetailsByAssetId(assetId) {
    const [rows] = await pool.query(
        `SELECT * FROM windingdetails WHERE assetId = ?`,
         [assetId]
    );
    return rows.length > 0 ? rows[0] : null;
}

// Upsert winding details (Insert or Update if exists)
async function upsertWindingDetails(data) {
    const { assetId, ...details } = data;

    // Filter input data against allowed columns
    const safeDetails = {};
    Object.keys(details).forEach(key => {
        if (ALLOWED_COLUMNS.includes(key)) {
            // Handle JSON stringification for slot_turns
            if (JSON_COLUMNS.includes(key) && details[key] !== null && typeof details[key] === 'object') {
                safeDetails[key] = JSON.stringify(details[key]);
            } else {
                safeDetails[key] = details[key];
            }
        }
    });

    if (Object.keys(safeDetails).length === 0) {
        return getWindingDetailsByAssetId(assetId);
    }

    const fields = ['assetId', ...Object.keys(safeDetails)];
    const placeholders = fields.map(() => '?').join(', ');
    const values = [assetId, ...Object.values(safeDetails)];

    const updateClause = Object.keys(safeDetails)
        .map(field => `${field} = VALUES(${field})`)
        .join(', ');

    await pool.query(
        `INSERT INTO windingdetails (${fields.join(', ')})
         VALUES (${placeholders})
         ON DUPLICATE KEY UPDATE ${updateClause}`,
        values
    );

    return getWindingDetailsByAssetId(assetId);
}

module.exports = {
    getWindingDetailsByAssetId,
    upsertWindingDetails
};
