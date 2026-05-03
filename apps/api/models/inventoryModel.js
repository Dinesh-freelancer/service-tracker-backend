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

// FIFO Batch Management Functions
async function createBatch(connection, partId, costPrice, qty, sourceType, sourceId) {
    const db = connection || pool;
    const [result] = await db.query(
        `INSERT INTO inventory_batches (PartId, CostPrice, OriginalQty, QuantityRemaining, SourceType, SourceId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [partId, costPrice, qty, qty, sourceType, sourceId]
    );

    // Update total QuantityInStock in main inventory table
    await db.query(
        `UPDATE inventory SET QuantityInStock = QuantityInStock + ? WHERE PartId = ?`,
        [qty, partId]
    );

    return result.insertId;
}

async function consumePartFIFO(connection, partId, requiredQty) {
    const db = connection || pool;
    let qtyLeftToConsume = requiredQty;
    let totalCost = 0;

    // Get available batches ordered by oldest first and lock them to prevent race conditions
    const [batches] = await db.query(
        `SELECT * FROM inventory_batches
         WHERE PartId = ? AND QuantityRemaining > 0
         ORDER BY ReceivedAt ASC, BatchId ASC FOR UPDATE`,
        [partId]
    );

    for (const batch of batches) {
        if (qtyLeftToConsume <= 0) break;

        const qtyFromThisBatch = Math.min(batch.QuantityRemaining, qtyLeftToConsume);

        // Deduct from this batch
        await db.query(
            `UPDATE inventory_batches SET QuantityRemaining = QuantityRemaining - ? WHERE BatchId = ?`,
            [qtyFromThisBatch, batch.BatchId]
        );

        totalCost += qtyFromThisBatch * batch.CostPrice;
        qtyLeftToConsume -= qtyFromThisBatch;
    }

    if (qtyLeftToConsume > 0) {
        // If we run out of batches but still need parts, fallback to default cost price from main inventory
        const [inventoryRow] = await db.query(`SELECT DefaultCostPrice FROM inventory WHERE PartId = ?`, [partId]);
        const fallbackCost = inventoryRow.length > 0 ? inventoryRow[0].DefaultCostPrice : 0;
        totalCost += qtyLeftToConsume * fallbackCost;
    }

    // Always update total QuantityInStock in main inventory table
    await db.query(
        `UPDATE inventory SET QuantityInStock = QuantityInStock - ? WHERE PartId = ?`,
        [requiredQty, partId]
    );

    // Return the calculated average unit cost for the consumed amount
    return requiredQty > 0 ? totalCost / requiredQty : 0;
}

async function restorePartFIFO(connection, partId, returnedQty, costPrice) {
    const db = connection || pool;
    // When returning parts (e.g., deleted from a job), we can either put them back into the newest active batch,
    // or just create an 'Adjustment' batch for the returned parts. Creating an adjustment is cleaner.
    await createBatch(db, partId, costPrice, returnedQty, 'Return', null);
}

module.exports = {
    getAllInventory,
    getInventoryById,
    addInventory,
    updateInventory,
    deleteInventory,
    createBatch,
    consumePartFIFO,
    restorePartFIFO
};
