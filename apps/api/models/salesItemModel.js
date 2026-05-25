const pool = require('../db');

// Get all sales items
async function getAllSalesItems() {
    let query = 'SELECT * FROM sales_items ORDER BY CreatedAt DESC';
    const [rows] = await pool.query(query);
    return rows;
}

// Get sales item by ID
async function getSalesItemById(id) {
    const [rows] = await pool.query('SELECT * FROM sales_items WHERE ItemId = ?', [id]);
    return rows[0];
}

// Create new sales item
async function addSalesItem(itemData) {
    const { Category, Name, Status, Specs, Images } = itemData;
    const [result] = await pool.query(
        `INSERT INTO sales_items (Category, Name, Status, Specs, Images) VALUES (?, ?, ?, ?, ?)`,
        [Category, Name, Status || 'Available', JSON.stringify(Specs || {}), JSON.stringify(Images || [])]
    );
    return result.insertId;
}

// Update sales item
async function updateSalesItem(id, itemData) {
    const { Category, Name, Status, Specs, Images } = itemData;
    await pool.query(
        `UPDATE sales_items SET Category = ?, Name = ?, Status = ?, Specs = ?, Images = ? WHERE ItemId = ?`,
        [Category, Name, Status, JSON.stringify(Specs || {}), JSON.stringify(Images || []), id]
    );
}

// Delete sales item
async function deleteSalesItem(id) {
    await pool.query('DELETE FROM sales_items WHERE ItemId = ?', [id]);
}

module.exports = {
    getAllSalesItems,
    getSalesItemById,
    addSalesItem,
    updateSalesItem,
    deleteSalesItem
};
