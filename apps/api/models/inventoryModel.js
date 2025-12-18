const pool = require('../db');

// Get all inventory items with pagination
async function getAllInventory(filters = {}, limit = 10, offset = 0) {
    let query = 'SELECT * FROM inventory';
    let countQuery = 'SELECT COUNT(*) as count FROM inventory';
    let params = [];
    let whereClauses = [];

    // Filter by low stock
    if (filters.lowStock) {
        whereClauses.push('QuantityInStock <= LowStockThreshold');
    }

    // Search by name
    if (filters.search) {
        whereClauses.push('PartName LIKE ?');
        params.push(`%${filters.search}%`);
    }

    if (whereClauses.length > 0) {
        const whereSql = ' WHERE ' + whereClauses.join(' AND ');
        query += whereSql;
        countQuery += whereSql;
    }

    query += ' ORDER BY PartName ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Count query
    let countParams = params.slice(0, -2);
    const [countRows] = await pool.query(countQuery, countParams);

    return { rows, totalCount: countRows[0].count };
}

async function getInventoryById(partId) {
    const [rows] = await pool.query(
        'SELECT * FROM inventory WHERE PartId = ?', [partId]
    );
    return rows[0];
}

async function addInventory(itemData) {
    const fields = Object.keys(itemData);
    const values = Object.values(itemData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO inventory (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    const [rows] = await pool.query('SELECT * FROM inventory WHERE PartId = ?', [result.insertId]);
    return rows[0];
}

async function updateInventory(partId, itemData) {
    const fields = Object.keys(itemData).map(field => `${field} = ?`);
    const values = Object.values(itemData);
    values.push(partId);

    await pool.query(
        `UPDATE inventory SET ${fields.join(', ')} WHERE PartId = ?`,
        values
    );
    const [rows] = await pool.query('SELECT * FROM inventory WHERE PartId = ?', [partId]);
    return rows[0];
}

async function deleteInventory(partId) {
    await pool.query('DELETE FROM inventory WHERE PartId = ?', [partId]);
}

module.exports = {
    getAllInventory,
    getInventoryById,
    addInventory,
    updateInventory,
    deleteInventory
};
