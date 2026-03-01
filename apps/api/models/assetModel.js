const pool = require('../db');

// Get all assets for a customer
async function getAssetsByCustomerId(customerId) {
    const [rows] = await pool.query(
        `SELECT * FROM assets WHERE CustomerId = ? ORDER BY CreatedAt DESC`,
        [customerId]
    );
    return rows;
}

// Get asset by ID
async function getAssetById(assetId) {
    const [rows] = await pool.query(
        `SELECT * FROM assets WHERE AssetId = ?`,
        [assetId]
    );
    return rows[0];
}

// Create new asset
// Accepts optional connection for transactions
async function createAsset(assetData, connection = null) {
    const db = connection || pool;
    // assetData now potentially includes 'Phase' ('1-PHASE', '3-PHASE')
    const fields = Object.keys(assetData);
    const values = Object.values(assetData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await db.query(
        `INSERT INTO assets (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );

    // Fetch the created asset
    const [rows] = await db.query('SELECT * FROM assets WHERE AssetId = ?', [result.insertId]);
    return rows[0];
}

// Update asset
async function updateAsset(assetId, updateData) {
    const fields = Object.keys(updateData).map(field => `${field} = ?`);
    const values = Object.values(updateData);
    values.push(assetId);

    const query = `UPDATE assets SET ${fields.join(', ')} WHERE AssetId = ?`;
    await pool.query(query, values);

    const [rows] = await pool.query('SELECT * FROM assets WHERE AssetId = ?', [assetId]);
    return rows[0];
}

// Search assets (for global search or specific lookup)
async function searchAssets(queryStr) {
    const term = `%${queryStr}%`;
    const [rows] = await pool.query(
        `SELECT a.*, c.CustomerName
         FROM assets a
         JOIN customerdetails c ON a.CustomerId = c.CustomerId
         WHERE a.InternalTag LIKE ?
            OR a.Brand LIKE ?
            OR a.PumpModel LIKE ?
            OR a.MotorModel LIKE ?
            OR a.SerialNumber LIKE ?
         LIMIT 20`,
        [term, term, term, term, term]
    );
    return rows;
}

module.exports = {
    getAssetsByCustomerId,
    getAssetById,
    createAsset,
    updateAsset,
    searchAssets
};
