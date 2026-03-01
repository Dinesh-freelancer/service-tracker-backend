const pool = require('../db');

// Allowed columns for Winding Details based on new DDL
// Using AssetId to match standard database casing conventions in this project
const ALLOWED_COLUMNS = [
    'AssetId', 'hp', 'kw', 'phase', 'connection_type',
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
        `SELECT * FROM windingdetails WHERE AssetId = ?`,
         [assetId]
    );
    return rows.length > 0 ? rows[0] : null;
}

// Upsert winding details (Insert or Update if exists)
async function upsertWindingDetails(data) {
    // Map incoming assetId to the DB column name AssetId
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

    // If there's nothing to update (which shouldn't happen usually, but just in case)
    // we still might want to just insert an empty shell, but let's proceed.

    // Explicitly add AssetId to the front of the query arrays
    const fields = ['AssetId', ...Object.keys(safeDetails)];
    const placeholders = fields.map(() => '?').join(', ');
    const values = [assetId, ...Object.values(safeDetails)];

    // Build ON DUPLICATE KEY UPDATE clause
    // We don't need to update AssetId, just the other fields
    let updateClause = '';
    if (Object.keys(safeDetails).length > 0) {
        updateClause = 'ON DUPLICATE KEY UPDATE ' + Object.keys(safeDetails)
            .map(field => `${field} = VALUES(${field})`)
            .join(', ');
    } else {
        // If somehow we have no fields other than AssetId, just update AssetId to itself to avoid syntax error
        updateClause = 'ON DUPLICATE KEY UPDATE AssetId = VALUES(AssetId)';
    }

    await pool.query(
        `INSERT INTO windingdetails (${fields.join(', ')})
         VALUES (${placeholders})
         ${updateClause}`,
        values
    );

    return getWindingDetailsByAssetId(assetId);
}

module.exports = {
    getWindingDetailsByAssetId,
    upsertWindingDetails
};
