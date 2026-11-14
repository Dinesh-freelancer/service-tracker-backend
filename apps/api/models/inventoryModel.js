const pool = require('../db');

/**
 * Autocomplete search for shared tags.
 */
async function searchTags(query = '', limit = 20) {
    const trimmed = String(query || '').trim();
    const maxLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    if (!trimmed) {
        const [rows] = await pool.query(
            'SELECT TagId, TagName FROM tags ORDER BY TagName ASC LIMIT ?',
            [maxLimit]
        );
        return rows;
    }
    const [rows] = await pool.query(
        'SELECT TagId, TagName FROM tags WHERE TagName LIKE ? ORDER BY TagName ASC LIMIT ?',
        [`%${trimmed}%`, maxLimit]
    );
    return rows;
}

/**
 * Replace all tags for a part inside a transaction.
 */
async function syncPartTags(connection, partId, tags) {
    if (!Array.isArray(tags)) return;

    const normalizedMap = new Map();
    for (const t of tags) {
        const rawName = typeof t === 'string' ? t : (t && t.TagName ? t.TagName : '');
        const clean = String(rawName).trim();
        if (clean && !normalizedMap.has(clean.toLowerCase())) {
            normalizedMap.set(clean.toLowerCase(), clean);
        }
    }
    const tagNames = Array.from(normalizedMap.values());

    await connection.query('DELETE FROM inventory_tags WHERE PartId = ?', [partId]);

    if (tagNames.length > 0) {
        const insertValues = tagNames.map(name => [name]);
        await connection.query('INSERT IGNORE INTO tags (TagName) VALUES ?', [insertValues]);

        const [tagRows] = await connection.query(
            'SELECT TagId FROM tags WHERE TagName IN (?)',
            [tagNames]
        );

        if (tagRows.length > 0) {
            const junctionValues = tagRows.map(r => [partId, r.TagId]);
            await connection.query(
                'INSERT IGNORE INTO inventory_tags (PartId, TagId) VALUES ?',
                [junctionValues]
            );
        }
    }

    await connection.query(
        'UPDATE inventory SET LastUpdated = CURRENT_TIMESTAMP WHERE PartId = ?',
        [partId]
    );
}

/**
 * Batch-attach Tags and StockLocations to inventory rows.
 */
async function attachTagsAndStock(rows) {
    if (!rows || rows.length === 0) return rows;

    const partIds = rows.map(r => r.PartId);

    const [tagRows] = await pool.query(
        `SELECT it.PartId, t.TagId, t.TagName
         FROM inventory_tags it
         JOIN tags t ON it.TagId = t.TagId
         WHERE it.PartId IN (?)
         ORDER BY t.TagName ASC`,
        [partIds]
    );

    const [stockRows] = await pool.query(
        `SELECT s.*, l.Name AS LocationName, l.LocationType, l.FullPath
         FROM inventory_stock s
         JOIN locations l ON s.LocationId = l.LocationId
         WHERE s.PartId IN (?)
         ORDER BY (s.PackType = 'Loose') DESC, s.Quantity DESC, l.FullPath ASC`,
        [partIds]
    );

    const tagsByPart = new Map();
    for (const row of tagRows) {
        if (!tagsByPart.has(row.PartId)) tagsByPart.set(row.PartId, []);
        tagsByPart.get(row.PartId).push({ TagId: row.TagId, TagName: row.TagName });
    }

    const stockByPart = new Map();
    for (const row of stockRows) {
        if (!stockByPart.has(row.PartId)) stockByPart.set(row.PartId, []);
        stockByPart.get(row.PartId).push(row);
    }

    return rows.map(item => ({
        ...item,
        Tags: tagsByPart.get(item.PartId) || [],
        StockLocations: stockByPart.get(item.PartId) || []
    }));
}

/**
 * Get all inventory items with pagination, search (PartName, Make, Size, Tags), and tag filters.
 */
async function getAllInventory(filters = {}, limit = 10, offset = 0) {
    let query = 'SELECT * FROM inventory i';
    let countQuery = 'SELECT COUNT(*) as count FROM inventory i';
    const params = [];
    const whereClauses = [];

    if (filters.lowStock) {
        whereClauses.push('i.QuantityInStock <= i.LowStockThreshold');
    }

    if (filters.search) {
        const term = `%${filters.search}%`;
        whereClauses.push(
            `(i.PartName LIKE ? OR i.Make LIKE ? OR i.Size LIKE ? OR EXISTS (
                SELECT 1 FROM inventory_tags it
                JOIN tags t ON it.TagId = t.TagId
                WHERE it.PartId = i.PartId AND t.TagName LIKE ?
            ))`
        );
        params.push(term, term, term, term);
    }

    if (filters.tagIds) {
        const ids = (Array.isArray(filters.tagIds) ? filters.tagIds : String(filters.tagIds).split(','))
            .map(id => parseInt(id, 10))
            .filter(id => !Number.isNaN(id));
        if (ids.length > 0) {
            whereClauses.push(
                `EXISTS (SELECT 1 FROM inventory_tags it WHERE it.PartId = i.PartId AND it.TagId IN (?))`
            );
            params.push(ids);
        }
    }

    if (filters.tags) {
        const tagNames = (Array.isArray(filters.tags) ? filters.tags : String(filters.tags).split(','))
            .map(t => t.trim())
            .filter(Boolean);
        if (tagNames.length > 0) {
            whereClauses.push(
                `EXISTS (
                    SELECT 1 FROM inventory_tags it
                    JOIN tags t ON it.TagId = t.TagId
                    WHERE it.PartId = i.PartId AND t.TagName IN (?)
                )`
            );
            params.push(tagNames);
        }
    }

    if (whereClauses.length > 0) {
        const whereSql = ' WHERE ' + whereClauses.join(' AND ');
        query += whereSql;
        countQuery += whereSql;
    }

    query += ' ORDER BY i.PartName ASC, i.Make ASC, i.Size ASC LIMIT ? OFFSET ?';
    const countParams = [...params];
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);

    const enrichedRows = await attachTagsAndStock(rows);
    return { rows: enrichedRows, totalCount: countRows[0].count };
}

async function getInventoryById(partId) {
    const [rows] = await pool.query('SELECT * FROM inventory WHERE PartId = ?', [partId]);
    if (rows.length === 0) return null;
    const enriched = await attachTagsAndStock(rows);
    return enriched[0];
}

async function addInventory(itemData) {
    const { Tags, StockLocations, ...rest } = itemData;
    const data = {
        ...rest,
        Make: rest.Make !== undefined && rest.Make !== null ? String(rest.Make).trim() : '',
        Size: rest.Size !== undefined && rest.Size !== null ? String(rest.Size).trim() : ''
    };

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const fields = Object.keys(data);
        const values = Object.values(data);
        const placeholders = fields.map(() => '?').join(', ');

        const [result] = await connection.query(
            `INSERT INTO inventory (${fields.join(', ')}) VALUES (${placeholders})`,
            values
        );
        const partId = result.insertId;

        if (Array.isArray(Tags)) {
            await syncPartTags(connection, partId, Tags);
        }

        if (Array.isArray(StockLocations) && StockLocations.length > 0) {
            for (const stock of StockLocations) {
                await upsertStock(connection, {
                    PartId: partId,
                    LocationId: stock.LocationId,
                    PackType: stock.PackType || 'Loose',
                    UnitsPerPack: stock.UnitsPerPack || 1,
                    SetQuantity: stock.Quantity !== undefined ? stock.Quantity : 0,
                    syncMaster: false
                });
            }
            await recalculateMasterStock(connection, partId);
        }

        await connection.commit();
        return getInventoryById(partId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function updateInventory(partId, itemData) {
    const { Tags, StockLocations, ...rest } = itemData;
    const data = { ...rest };
    if ('Make' in data) {
        data.Make = data.Make !== null && data.Make !== undefined ? String(data.Make).trim() : '';
    }
    if ('Size' in data) {
        data.Size = data.Size !== null && data.Size !== undefined ? String(data.Size).trim() : '';
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query('SELECT PartId FROM inventory WHERE PartId = ?', [partId]);
        if (existing.length === 0) {
            await connection.rollback();
            return null;
        }

        const keys = Object.keys(data);
        if (keys.length > 0) {
            const fields = keys.map(field => `${field} = ?`);
            const values = Object.values(data);
            values.push(partId);

            await connection.query(
                `UPDATE inventory SET ${fields.join(', ')} WHERE PartId = ?`,
                values
            );
        }

        if (Tags !== undefined) {
            await syncPartTags(connection, partId, Tags);
        }

        await connection.commit();
        return getInventoryById(partId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function deleteInventory(partId) {
    await pool.query('DELETE FROM inventory WHERE PartId = ?', [partId]);
}

/**
 * Secondary Stock (Location + PackType + UnitsPerPack) Management
 */
async function getStockByPartId(partId) {
    const [rows] = await pool.query(
        `SELECT s.*, l.Name AS LocationName, l.LocationType, l.FullPath
         FROM inventory_stock s
         JOIN locations l ON s.LocationId = l.LocationId
         WHERE s.PartId = ?
         ORDER BY (s.PackType = 'Loose') DESC, s.Quantity DESC, l.FullPath ASC`,
        [partId]
    );
    return rows;
}

async function recalculateMasterStock(connection, partId) {
    const db = connection || pool;
    const [sumRows] = await db.query(
        'SELECT COALESCE(SUM(Quantity), 0) AS totalQty FROM inventory_stock WHERE PartId = ?',
        [partId]
    );
    const totalQty = sumRows[0].totalQty;
    await db.query(
        'UPDATE inventory SET QuantityInStock = ?, LastUpdated = CURRENT_TIMESTAMP WHERE PartId = ?',
        [totalQty, partId]
    );
    return totalQty;
}

async function upsertStock(connection, {
    PartId,
    LocationId,
    PackType = 'Loose',
    UnitsPerPack = 1,
    QuantityDelta = 0,
    SetQuantity = null,
    syncMaster = true
}) {
    const db = connection || pool;
    const ownConnection = !connection;
    const conn = ownConnection ? await pool.getConnection() : db;

    try {
        if (ownConnection) await conn.beginTransaction();

        const cleanPackType = String(PackType || 'Loose').trim() || 'Loose';
        const packUnits = parseFloat(UnitsPerPack) || 1;

        if (SetQuantity !== null && SetQuantity !== undefined) {
            await conn.query(
                `INSERT INTO inventory_stock (PartId, LocationId, PackType, UnitsPerPack, Quantity)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE Quantity = VALUES(Quantity), LastUpdated = CURRENT_TIMESTAMP`,
                [PartId, LocationId, cleanPackType, packUnits, SetQuantity]
            );
        } else {
            await conn.query(
                `INSERT INTO inventory_stock (PartId, LocationId, PackType, UnitsPerPack, Quantity)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE Quantity = Quantity + VALUES(Quantity), LastUpdated = CURRENT_TIMESTAMP`,
                [PartId, LocationId, cleanPackType, packUnits, QuantityDelta]
            );
        }

        if (syncMaster) {
            await recalculateMasterStock(conn, PartId);
        }

        if (ownConnection) await conn.commit();
        return getStockByPartId(PartId);
    } catch (err) {
        if (ownConnection) await conn.rollback();
        throw err;
    } finally {
        if (ownConnection) conn.release();
    }
}

async function deductStock(connection, partId, qty, stockId = null, { syncMaster = true } = {}) {
    const db = connection || pool;
    let targetRow = null;

    if (stockId) {
        const [rows] = await db.query(
            'SELECT * FROM inventory_stock WHERE StockId = ? AND PartId = ? FOR UPDATE',
            [stockId, partId]
        );
        if (rows.length === 0) {
            const err = new Error('Selected stock location/pack not found for this part');
            err.statusCode = 400;
            throw err;
        }
        targetRow = rows[0];
    } else {
        // Default to Loose pack with stock first
        const [rows] = await db.query(
            `SELECT * FROM inventory_stock
             WHERE PartId = ? AND Quantity > 0
             ORDER BY (PackType = 'Loose') DESC, Quantity DESC
             LIMIT 1 FOR UPDATE`,
            [partId]
        );
        if (rows.length > 0) {
            targetRow = rows[0];
        }
    }

    if (targetRow) {
        await db.query(
            'UPDATE inventory_stock SET Quantity = Quantity - ?, LastUpdated = CURRENT_TIMESTAMP WHERE StockId = ?',
            [qty, targetRow.StockId]
        );
    }

    if (syncMaster) {
        await db.query(
            'UPDATE inventory SET QuantityInStock = QuantityInStock - ?, LastUpdated = CURRENT_TIMESTAMP WHERE PartId = ?',
            [qty, partId]
        );
    }

    return targetRow ? targetRow.StockId : null;
}

async function restoreStock(connection, partId, qty, stockId = null, { syncMaster = true } = {}) {
    const db = connection || pool;
    let targetStockId = stockId;

    if (!targetStockId) {
        const [rows] = await db.query(
            `SELECT StockId FROM inventory_stock
             WHERE PartId = ?
             ORDER BY (PackType = 'Loose') DESC, StockId ASC
             LIMIT 1 FOR UPDATE`,
            [partId]
        );
        if (rows.length > 0) {
            targetStockId = rows[0].StockId;
        }
    }

    if (targetStockId) {
        await db.query(
            'UPDATE inventory_stock SET Quantity = Quantity + ?, LastUpdated = CURRENT_TIMESTAMP WHERE StockId = ?',
            [qty, targetStockId]
        );
    }

    if (syncMaster) {
        await db.query(
            'UPDATE inventory SET QuantityInStock = QuantityInStock + ?, LastUpdated = CURRENT_TIMESTAMP WHERE PartId = ?',
            [qty, partId]
        );
    }
}

// FIFO Batch Management Functions
async function createBatch(connection, partId, costPrice, qty, sourceType, sourceId, { skipMasterUpdate = false } = {}) {
    const db = connection || pool;
    const [result] = await db.query(
        `INSERT INTO inventory_batches (PartId, CostPrice, OriginalQty, QuantityRemaining, SourceType, SourceId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [partId, costPrice, qty, qty, sourceType, sourceId]
    );

    if (!skipMasterUpdate) {
        await db.query(
            `UPDATE inventory SET QuantityInStock = QuantityInStock + ?, LastUpdated = CURRENT_TIMESTAMP WHERE PartId = ?`,
            [qty, partId]
        );
    }

    return result.insertId;
}

async function consumePartFIFO(connection, partId, requiredQty, { skipMasterUpdate = false } = {}) {
    const db = connection || pool;
    let qtyLeftToConsume = requiredQty;
    let totalCost = 0;

    const [batches] = await db.query(
        `SELECT * FROM inventory_batches
         WHERE PartId = ? AND QuantityRemaining > 0
         ORDER BY ReceivedAt ASC, BatchId ASC FOR UPDATE`,
        [partId]
    );

    for (const batch of batches) {
        if (qtyLeftToConsume <= 0) break;

        const qtyFromThisBatch = Math.min(batch.QuantityRemaining, qtyLeftToConsume);

        await db.query(
            `UPDATE inventory_batches SET QuantityRemaining = QuantityRemaining - ? WHERE BatchId = ?`,
            [qtyFromThisBatch, batch.BatchId]
        );

        totalCost += qtyFromThisBatch * batch.CostPrice;
        qtyLeftToConsume -= qtyFromThisBatch;
    }

    if (qtyLeftToConsume > 0) {
        const [inventoryRow] = await db.query(`SELECT DefaultCostPrice FROM inventory WHERE PartId = ?`, [partId]);
        const fallbackCost = inventoryRow.length > 0 ? inventoryRow[0].DefaultCostPrice : 0;
        totalCost += qtyLeftToConsume * fallbackCost;
    }

    if (!skipMasterUpdate) {
        await db.query(
            `UPDATE inventory SET QuantityInStock = QuantityInStock - ?, LastUpdated = CURRENT_TIMESTAMP WHERE PartId = ?`,
            [requiredQty, partId]
        );
    }

    return requiredQty > 0 ? totalCost / requiredQty : 0;
}

async function restorePartFIFO(connection, partId, returnedQty, costPrice, { skipMasterUpdate = false } = {}) {
    const db = connection || pool;
    await createBatch(db, partId, costPrice, returnedQty, 'Return', null, { skipMasterUpdate });
}

module.exports = {
    searchTags,
    syncPartTags,
    getAllInventory,
    getInventoryById,
    addInventory,
    updateInventory,
    deleteInventory,
    getStockByPartId,
    recalculateMasterStock,
    upsertStock,
    deductStock,
    restoreStock,
    createBatch,
    consumePartFIFO,
    restorePartFIFO
};
