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

const inventoryModel = require('./inventoryModel');

async function addPartUsed(partData) {
    let { JobNumber, PartId, PartName, Qty, CostPrice, SellingPrice } = partData;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Calculate actual FIFO cost if PartId is provided
        if (PartId) {
            CostPrice = await inventoryModel.consumePartFIFO(connection, PartId, Qty);
        }

        const [result] = await connection.query(
            `INSERT INTO partsused (JobNumber, PartId, PartName, Qty, CostPrice, SellingPrice)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [JobNumber, PartId, PartName, Qty, CostPrice, SellingPrice]
        );

        await connection.commit();
        const [rows] = await pool.query('SELECT * FROM partsused WHERE PartUsedId = ?', [result.insertId]);
        return rows[0];
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function deletePartUsed(partUsedId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Find the part used to restore stock
        const [rows] = await connection.query('SELECT * FROM partsused WHERE PartUsedId = ?', [partUsedId]);
        if (rows.length > 0) {
            const partUsed = rows[0];
            if (partUsed.PartId) {
                await inventoryModel.restorePartFIFO(connection, partUsed.PartId, partUsed.Qty, partUsed.CostPrice);
            }
        }

        await connection.query('DELETE FROM partsused WHERE PartUsedId = ?', [partUsedId]);

        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = {
    getAllPartsUsed,
    getPartsUsedByJob,
    getPartUsedById,
    addPartUsed,
    deletePartUsed
};
