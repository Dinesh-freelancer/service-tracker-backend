const pool = require('../db');

/**
 * Retrieves all inventory items with pagination and filtering.
 * @param {Object} [filters] - Search filters.
 * @param {string} [filters.sql] - WHERE clause.
 * @param {Array} [filters.params] - Parameters for WHERE clause.
 * @param {number} [limit] - Items per page.
 * @param {number} [offset] - Offset.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and totalCount.
 */
async function getAllInventory(filters = {}, limit, offset) {
    let query = 'SELECT * FROM Inventory';
    const params = [];

    if (filters.sql) {
        query += ` ${filters.sql}`;
        params.push(...filters.params);
    }

    query += ' ORDER BY PartName';

    if (limit !== undefined && offset !== undefined) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
    }

    const [rows] = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) as count FROM Inventory';
    const countParams = [];
    if (filters.sql) {
        countQuery += ` ${filters.sql}`;
        countParams.push(...filters.params);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const totalCount = countResult[0].count;

    return { rows, totalCount };
}

// Get inventory item by PartId
async function getInventoryById(partId) {
    const [rows] = await pool.query(
        'SELECT * FROM Inventory WHERE PartId = ?', [partId]
    );
    return rows[0];
}

// Add new inventory item
async function addInventory(data) {
    const {
        PartName,
        Unit,
        DefaultCostPrice,
        DefaultSellingPrice,
        Supplier,
        QuantityInStock,
        LowStockThreshold,
        Notes
    } = data;

    const [result] = await pool.query(
        `INSERT INTO Inventory (
      PartName, Unit, DefaultCostPrice, DefaultSellingPrice,
      Supplier, QuantityInStock, LowStockThreshold, Notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [PartName, Unit, DefaultCostPrice, DefaultSellingPrice, Supplier, QuantityInStock, LowStockThreshold, Notes]
    );

    return await getInventoryById(result.insertId);
}

module.exports = {
    getAllInventory,
    getInventoryById,
    addInventory
};