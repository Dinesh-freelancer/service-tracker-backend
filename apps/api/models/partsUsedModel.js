const pool = require('../db');

// Get all parts used with optional filters
async function getAllPartsUsed(jobNumber) {
    // Controller calls with just 'jobNumber' usually, or separate filters obj
    let query = 'SELECT * FROM partsused ORDER BY JobNumber, PartUsedId';
    let params = [];

    if (jobNumber) {
        query = 'SELECT * FROM partsused WHERE JobNumber = ? ORDER BY PartUsedId';
        params.push(jobNumber);
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

// Get parts used for a specific job (redundant but kept if used)
async function getPartsUsedByJob(jobNumber) {
    const [rows] = await pool.query(
        'SELECT * FROM partsused WHERE JobNumber = ? ORDER BY PartUsedId', [jobNumber]
    );
    return rows;
}

async function getPartUsedById(partUsedId) {
    const [rows] = await pool.query(
        'SELECT * FROM partsused WHERE PartUsedId = ?', [partUsedId]
    );
    return rows[0];
}

async function addPartUsed(partData) {
    const { JobNumber, PartId, Qty, CostPrice, SellingPrice } = partData;
    const [result] = await pool.query(
        `INSERT INTO partsused (JobNumber, PartId, Qty, CostPrice, SellingPrice)
     VALUES (?, ?, ?, ?, ?)`,
        [JobNumber, PartId, Qty, CostPrice, SellingPrice]
    );
    const [rows] = await pool.query('SELECT * FROM partsused WHERE PartUsedId = ?', [result.insertId]);
    return rows[0];
}

async function deletePartUsed(partUsedId) {
    await pool.query('DELETE FROM partsused WHERE PartUsedId = ?', [partUsedId]);
}

module.exports = {
    getAllPartsUsed,
    getPartsUsedByJob,
    getPartUsedById,
    addPartUsed,
    deletePartUsed
};
