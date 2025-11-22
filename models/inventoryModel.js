const pool = require('../db');

// Get all inventory items
async function getAllInventory() {
    const [rows] = await pool.query(
        'SELECT * FROM Inventory ORDER BY PartName'
    );
    return rows;
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