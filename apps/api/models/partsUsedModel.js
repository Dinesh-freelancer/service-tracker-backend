const pool = require('../db');

const BASE_SELECT = `
    SELECT
        pu.*,
        COALESCE(i.Make, '') AS Make,
        COALESCE(i.Size, '') AS Size,
        COALESCE(i.Unit, '') AS Unit,
        s.PackType,
        l.FullPath AS LocationPath
    FROM partsused pu
    LEFT JOIN inventory i ON pu.PartId = i.PartId
    LEFT JOIN inventory_stock s ON pu.StockId = s.StockId
    LEFT JOIN locations l ON s.LocationId = l.LocationId
`;

// Get all parts used with optional filters
async function getAllPartsUsed(jobNumber) {
    // Controller calls with just 'jobNumber' usually, or separate filters obj
    let query = `${BASE_SELECT} ORDER BY pu.JobNumber, pu.PartUsedId`;
    let params = [];

    if (jobNumber) {
        query = `${BASE_SELECT} WHERE pu.JobNumber = ? ORDER BY pu.PartUsedId`;
        params.push(jobNumber);
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

// Get parts used for a specific job (redundant but kept if used)
async function getPartsUsedByJob(jobNumber) {
    const [rows] = await pool.query(
        `${BASE_SELECT} WHERE pu.JobNumber = ? ORDER BY pu.PartUsedId`, [jobNumber]
    );
    return rows;
}

async function getPartUsedById(partUsedId) {
    const [rows] = await pool.query(
        `${BASE_SELECT} WHERE pu.PartUsedId = ?`, [partUsedId]
    );
    return rows[0];
}

const inventoryModel = require('./inventoryModel');

async function addPartUsed(partData) {
    let { JobNumber, PartId, StockId, PartName, Qty, CostPrice, SellingPrice, CreatedBy = null } = partData;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        let usedStockId = StockId || null;

        // Calculate actual FIFO cost and deduct from secondary stock if PartId is provided
        if (PartId) {
            const totalCost = await inventoryModel.consumePartFIFO(connection, PartId, Qty, { skipMasterUpdate: true });
            CostPrice = totalCost; // Average unit cost returned by consumePartFIFO
            usedStockId = await inventoryModel.deductStock(connection, PartId, Qty, usedStockId, {
                syncMaster: true,
                movementMeta: {
                    MovementType: 'JobUsed',
                    ReferenceType: 'Job',
                    ReferenceId: JobNumber,
                    CreatedBy
                }
            });
        }

        const [result] = await connection.query(
            `INSERT INTO partsused (JobNumber, PartId, StockId, PartName, Qty, CostPrice, SellingPrice)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [JobNumber, PartId, usedStockId, PartName, Qty, CostPrice, SellingPrice]
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

async function updatePartUsedQuantity(partUsedId, newQty, userId = null) {
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
                const additionalUnitCost = await inventoryModel.consumePartFIFO(connection, partUsed.PartId, diffQty, { skipMasterUpdate: true });
                await inventoryModel.deductStock(connection, partUsed.PartId, diffQty, partUsed.StockId || null, {
                    syncMaster: true,
                    movementMeta: {
                        MovementType: 'JobUsed',
                        ReferenceType: 'Job',
                        ReferenceId: partUsed.JobNumber,
                        Notes: 'Quantity increased',
                        CreatedBy: userId
                    }
                });
                newCostPrice = ((oldQty * partUsed.CostPrice) + (additionalUnitCost * diffQty)) / newQty;
            } else {
                // We are reducing parts, restore them
                const returnedQty = Math.abs(diffQty);
                await inventoryModel.restorePartFIFO(connection, partUsed.PartId, returnedQty, partUsed.CostPrice, { skipMasterUpdate: true });
                await inventoryModel.restoreStock(connection, partUsed.PartId, returnedQty, partUsed.StockId || null, {
                    syncMaster: true,
                    movementMeta: {
                        MovementType: 'JobReturn',
                        ReferenceType: 'Job',
                        ReferenceId: partUsed.JobNumber,
                        Notes: 'Quantity reduced',
                        CreatedBy: userId
                    }
                });
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

async function deletePartUsed(partUsedId, userId = null) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Find the part used to restore stock
        const [rows] = await connection.query('SELECT * FROM partsused WHERE PartUsedId = ?', [partUsedId]);
        if (rows.length > 0) {
            const partUsed = rows[0];
            if (partUsed.PartId) {
                await inventoryModel.restorePartFIFO(connection, partUsed.PartId, partUsed.Qty, partUsed.CostPrice, { skipMasterUpdate: true });
                await inventoryModel.restoreStock(connection, partUsed.PartId, partUsed.Qty, partUsed.StockId || null, {
                    syncMaster: true,
                    movementMeta: {
                        MovementType: 'JobReturn',
                        ReferenceType: 'Job',
                        ReferenceId: partUsed.JobNumber,
                        Notes: 'Part removed from job',
                        CreatedBy: userId
                    }
                });
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
