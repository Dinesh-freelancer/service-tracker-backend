const pool = require('../db');

// Get inventory alerts
async function getInventoryAlerts(hideSensitive = true) {
    const query = `
    SELECT 
      PartId, PartName, QuantityInStock, LowStockThreshold, Unit, SupplierId
    FROM inventory
    WHERE QuantityInStock <= LowStockThreshold
  `;
    const [rows] = await pool.query(query);
    return rows;
}

module.exports = {
    getInventoryAlerts
};
