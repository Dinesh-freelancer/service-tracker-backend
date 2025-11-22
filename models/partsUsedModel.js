const pool = require('../db');

// Get all parts used (optionally filter by job number)
async function getAllPartsUsed(jobNumber = null) {
    if (jobNumber) {
        const [rows] = await pool.query(
            'SELECT * FROM PartsUsed WHERE JobNumber = ? ORDER BY PartUsedId', [jobNumber]
        );
        return rows;
    } else {
        const [rows] = await pool.query(
            'SELECT * FROM PartsUsed ORDER BY JobNumber, PartUsedId'
        );
        return rows;
    }
}

// Get single part used entry
async function getPartUsedById(partUsedId) {
    const [rows] = await pool.query(
        'SELECT * FROM PartsUsed WHERE PartUsedId = ?', [partUsedId]
    );
    return rows[0];
}

// Add new parts used entry
async function addPartUsed(data) {
    const {
        JobNumber,
        PartName,
        Unit,
        Qty,
        CostPrice,
        BilledPrice,
        Supplier,
        Notes
    } = data;

    const [result] = await pool.query(
        `INSERT INTO PartsUsed (
      JobNumber, PartName, Unit, Qty, CostPrice, BilledPrice, Supplier, Notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [JobNumber, PartName, Unit, Qty, CostPrice, BilledPrice, Supplier, Notes]
    );

    return await getPartUsedById(result.insertId);
}

module.exports = {
    getAllPartsUsed,
    getPartUsedById,
    addPartUsed
};