const pool = require('../db');

// Get all purchases with details
async function getAllPurchases(filters, hideSensitive = true) {
    let query = `
    SELECT
      p.*,
      s.SupplierName,
      u.Username AS PurchasedByName,
      COALESCE(SUM(pi.TotalPrice), 0) AS TotalAmount,
      COUNT(pi.PurchaseItemId) AS ItemCount
    FROM purchases p
    LEFT JOIN suppliers s ON p.SupplierId = s.SupplierId
    LEFT JOIN users u ON p.PurchasedBy = u.UserId
    LEFT JOIN purchaseitems pi ON p.PurchaseId = pi.PurchaseId
  `;
    let params = [];
    let whereClauses = [];

    if (filters.supplierId) {
        whereClauses.push('p.SupplierId = ?');
        params.push(filters.supplierId);
    }

    // Date filters...

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' GROUP BY p.PurchaseId ORDER BY p.PurchaseDate DESC';

    const [rows] = await pool.query(query, params);

    return rows;
}

async function getPurchaseById(purchaseId) {
    const [rows] = await pool.query(
        `SELECT p.*, s.SupplierName, u.Username AS PurchasedByName
     FROM purchases p
     LEFT JOIN suppliers s ON p.SupplierId = s.SupplierId
     LEFT JOIN users u ON p.PurchasedBy = u.UserId
     WHERE p.PurchaseId = ?`,
        [purchaseId]
    );

    if (rows.length === 0) return null;

    const purchase = rows[0];

    // Get items
    const [items] = await pool.query(
        `SELECT pi.*, i.PartName, i.Unit
     FROM purchaseitems pi
     LEFT JOIN inventory i ON pi.PartId = i.PartId
     WHERE pi.PurchaseId = ?`,
        [purchaseId]
    );

    purchase.Items = items;
    return purchase;
}

async function createPurchase(purchaseData, items) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insert Purchase
        const pFields = Object.keys(purchaseData);
        const pValues = Object.values(purchaseData);
        const pPlaceholders = pFields.map(() => '?').join(', ');

        const [pResult] = await connection.query(
            `INSERT INTO purchases (${pFields.join(', ')}) VALUES (${pPlaceholders})`,
            pValues
        );
        const purchaseId = pResult.insertId;

        const inventoryModel = require('./inventoryModel');

        // Insert Items
        for (const item of items) {
            item.PurchaseId = purchaseId;
            const iFields = Object.keys(item);
            const iValues = Object.values(item);
            const iPlaceholders = iFields.map(() => '?').join(', ');

            await connection.query(
                `INSERT INTO purchaseitems (${iFields.join(', ')}) VALUES (${iPlaceholders})`,
                iValues
            );

            // Update Inventory Stock via new FIFO Batch system
            await inventoryModel.createBatch(connection, item.PartId, item.UnitPrice, item.Qty, 'Purchase', purchaseId);
        }

        await connection.commit();
        return purchaseId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase
};
