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
            const totalCost = await inventoryModel.consumePartFIFO(connection, PartId, Qty);
            CostPrice = totalCost / Qty; // Convert back to average unit cost price for this row
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

async function updatePartUsedQuantity(partUsedId, newQty) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get current part used record
        const [rows] = await connection.query('SELECT * FROM partsused WHERE PartUsedId = ?', [partUsedId]);
        if (rows.length === 0) {
            throw new Error('Part used record not found');
        }

        const partUsed = rows[0];
        const oldQty = partUsed.Qty;
        const diffQty = newQty - oldQty;

        let newCostPrice = partUsed.CostPrice;

        if (diffQty !== 0 && partUsed.PartId) {
            if (diffQty > 0) {
                // We need more parts, consume them
                const additionalCost = await inventoryModel.consumePartFIFO(connection, partUsed.PartId, diffQty);
                // Calculate new average cost price (additionalCost is the total cost of the diffQty)
                newCostPrice = ((oldQty * partUsed.CostPrice) + additionalCost) / newQty;
            } else {
                // We are reducing parts, restore them
                const returnedQty = Math.abs(diffQty);
                await inventoryModel.restorePartFIFO(connection, partUsed.PartId, returnedQty, partUsed.CostPrice);
                // Cost price per unit remains the same for the remaining parts
            }
        }

        // 3. Update the record
        await connection.query(
            'UPDATE partsused SET Qty = ?, CostPrice = ? WHERE PartUsedId = ?',
            [newQty, newCostPrice, partUsedId]
        );

        await connection.commit();

        const [updatedRows] = await pool.query('SELECT * FROM partsused WHERE PartUsedId = ?', [partUsedId]);
        return updatedRows[0];
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
    updatePartUsedQuantity,
    deletePartUsed
};
