const pool = require('../db');

// Get all parts with stock below threshold
async function getLowStockAlerts() {
    const [rows] = await pool.query(`
    SELECT 
      PartId,
      PartName,
      QuantityInStock,
      LowStockThreshold,
      Supplier,
      Notes
    FROM inventory
    WHERE QuantityInStock <= LowStockThreshold
    ORDER BY QuantityInStock ASC
  `);
    return rows;
}

// Get all parts with zero stock
async function getOutOfStockAlerts() {
    const [rows] = await pool.query(`
    SELECT 
      PartId,
      PartName,
      QuantityInStock,
      Supplier,
      Notes
    FROM inventory
    WHERE QuantityInStock = 0
    ORDER BY PartName
  `);
    return rows;
}

module.exports = {
    getLowStockAlerts,
    getOutOfStockAlerts
};