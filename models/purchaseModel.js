const pool = require('../db');

// Get all purchases with supplier and purchaser details
async function getAllPurchases() {
    const [rows] = await pool.query(`
    SELECT p.*, s.SupplierName, u.Username AS PurchasedByName
    FROM purchases p
    JOIN suppliers s ON p.SupplierId = s.SupplierId
    JOIN users u ON p.PurchasedBy = u.UserId
    ORDER BY p.PurchaseDate DESC
  `);
    return rows;
}

// Get single purchase by ID with items
async function getPurchaseById(purchaseId) {
    const [
        [purchase]
    ] = await pool.query(`
    SELECT p.*, s.SupplierName, u.Username AS PurchasedByName
    FROM purchases p
    JOIN suppliers s ON p.SupplierId = s.SupplierId
    JOIN users u ON p.PurchasedBy = u.UserId
    WHERE p.PurchaseId = ?
  `, [purchaseId]);

    if (!purchase) return null;

    const [items] = await pool.query(`
    SELECT pi.*, i.PartName, i.Unit
    FROM purchaseItems pi
    JOIN inventory i ON pi.PartId = i.PartId
    WHERE pi.PurchaseId = ?
  `, [purchaseId]);

    purchase.Items = items;
    return purchase;
}

// Create new purchase with items (transaction)
async function createPurchase(purchaseData, items) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { PurchaseDate, SupplierId, PurchasedBy, Notes } = purchaseData;
        const [result] = await connection.query(`
      INSERT INTO purchases (PurchaseDate, SupplierId, PurchasedBy, Notes)
      VALUES (?, ?, ?, ?)
    `, [PurchaseDate, SupplierId, PurchasedBy, Notes]);

        const purchaseId = result.insertId;

        for (const item of items) {
            const { PartId, Qty, UnitPrice, Notes: itemNotes } = item;
            await connection.query(`
        INSERT INTO purchaseItems (PurchaseId, PartId, Qty, UnitPrice, Notes)
        VALUES (?, ?, ?, ?, ?)
      `, [purchaseId, PartId, Qty, UnitPrice, itemNotes]);

            // Optional: Update inventory quantity (increase stock)
            await connection.query(`
        UPDATE inventory SET QuantityInStock = QuantityInStock + ?
        WHERE PartId = ?
      `, [Qty, PartId]);
        }

        await connection.commit();
        return await getPurchaseById(purchaseId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase
};