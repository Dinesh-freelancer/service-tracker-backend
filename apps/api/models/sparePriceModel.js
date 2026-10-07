const pool = require('../db');

/**
 * Ensures table exists if DB is newly provisioned.
 */
async function ensureTableExists() {
    const ddl = `
        CREATE TABLE IF NOT EXISTS spare_price_search (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          pump_category VARCHAR(50) NOT NULL,
          pump_type VARCHAR(120) NOT NULL,
          pump_size VARCHAR(50) NOT NULL,
          spare_name VARCHAR(200) NOT NULL,
          basic_material VARCHAR(150) NOT NULL,
          part_no VARCHAR(100) DEFAULT NULL,
          sap_material VARCHAR(100) DEFAULT NULL,
          unit_price DECIMAL(12,2) NOT NULL,
          uom VARCHAR(20) NOT NULL,
          last_synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_spare (pump_category, pump_type, pump_size, spare_name, basic_material),
          INDEX idx_spare_name (spare_name),
          INDEX idx_part_no (part_no),
          INDEX idx_pump (pump_category, pump_type, pump_size),
          INDEX idx_price (unit_price)
        );
    `;
    await pool.query(ddl);
}

/**
 * Safely URL decodes a string. If invalid, returns original string.
 */
function safeDecode(val) {
    if (!val || typeof val !== 'string') return val || '';
    try {
        return decodeURIComponent(val);
    } catch (e) {
        return val;
    }
}

/**
 * Upserts a single spare part record.
 */
async function upsertSpare(spareData) {
    const pumpCategory = spareData.pump_category || spareData.pumpCategory || '';
    const pumpType = spareData.pump_type || spareData.pumpType || '';
    const pumpSize = spareData.pump_size || spareData.pumpSize || '';
    const rawSpareName = spareData.spare_name || spareData.spareName || '';
    const rawBasicMaterial = spareData.basic_material || spareData.basicMaterial || '';
    const partNo = spareData.part_no || spareData.partNo || null;
    const sapMaterial = spareData.sap_material || spareData.sapMaterial || null;
    const unitPrice = parseFloat(spareData.unit_price ?? spareData.unitPrice ?? 0);
    const uom = spareData.uom || 'PC';

    const spareName = safeDecode(rawSpareName);
    const basicMaterial = safeDecode(rawBasicMaterial);

    const sql = `
        INSERT INTO spare_price_search (
            pump_category,
            pump_type,
            pump_size,
            spare_name,
            basic_material,
            part_no,
            sap_material,
            unit_price,
            uom
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            part_no = VALUES(part_no),
            sap_material = VALUES(sap_material),
            unit_price = VALUES(unit_price),
            uom = VALUES(uom),
            last_synced_at = CURRENT_TIMESTAMP;
    `;

    const values = [
        pumpCategory,
        pumpType,
        pumpSize,
        spareName,
        basicMaterial,
        partNo,
        sapMaterial,
        unitPrice,
        uom
    ];

    const [result] = await pool.query(sql, values);
    return result;
}

/**
 * Bulk syncs an array of spare part records in memory-safe batches.
 * Optimized for Aiven free tier DB (~20,000 records).
 */
async function bulkSyncSpares(sparesArray, batchSize = 500) {
    await ensureTableExists();

    let totalProcessed = 0;
    let totalInsertedOrUpdated = 0;

    for (let i = 0; i < sparesArray.length; i += batchSize) {
        const batch = sparesArray.slice(i, i + batchSize);
        if (batch.length === 0) continue;

        const values = [];
        const placeholders = [];

        for (const item of batch) {
            const pumpCategory = item.pump_category || item.pumpCategory || '';
            const pumpType = item.pump_type || item.pumpType || '';
            const pumpSize = item.pump_size || item.pumpSize || '';
            const spareName = safeDecode(item.spare_name || item.spareName || '');
            const basicMaterial = safeDecode(item.basic_material || item.basicMaterial || '');
            const partNo = item.part_no || item.partNo || null;
            const sapMaterial = item.sap_material || item.sapMaterial || null;
            const unitPrice = parseFloat(item.unit_price ?? item.unitPrice ?? 0);
            const uom = item.uom || 'PC';

            placeholders.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
            values.push(
                pumpCategory,
                pumpType,
                pumpSize,
                spareName,
                basicMaterial,
                partNo,
                sapMaterial,
                unitPrice,
                uom
            );
        }

        const sql = `
            INSERT INTO spare_price_search (
                pump_category,
                pump_type,
                pump_size,
                spare_name,
                basic_material,
                part_no,
                sap_material,
                unit_price,
                uom
            )
            VALUES ${placeholders.join(', ')}
            ON DUPLICATE KEY UPDATE
                part_no = VALUES(part_no),
                sap_material = VALUES(sap_material),
                unit_price = VALUES(unit_price),
                uom = VALUES(uom),
                last_synced_at = CURRENT_TIMESTAMP;
        `;

        const [res] = await pool.query(sql, values);
        totalProcessed += batch.length;
        totalInsertedOrUpdated += res.affectedRows;
    }

    return { totalProcessed, totalInsertedOrUpdated };
}

/**
 * Search spares with flexible filters and pagination.
 */
async function searchSpares(filters = {}) {
    await ensureTableExists();

    const {
        mode = 'spare', // 'spare' or 'pump'
        query = '',
        pumpCategory = '',
        pumpType = '',
        pumpSize = '',
        spareName = '',
        partNo = '',
        sapMaterial = '',
        page = 1,
        limit = 20
    } = filters;

    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    let whereClauses = [];
    let params = [];

    if (mode === 'pump') {
        if (pumpCategory) {
            whereClauses.push('pump_category = ?');
            params.push(pumpCategory);
        }
        if (pumpType) {
            whereClauses.push('pump_type = ?');
            params.push(pumpType);
        }
        if (pumpSize) {
            whereClauses.push('pump_size = ?');
            params.push(pumpSize);
        }
        if (query) {
            whereClauses.push('(pump_category LIKE ? OR pump_type LIKE ? OR pump_size LIKE ?)');
            const q = `%${query}%`;
            params.push(q, q, q);
        }
    } else {
        // Spare Search
        if (query) {
            whereClauses.push('(spare_name LIKE ? OR part_no LIKE ? OR sap_material LIKE ? OR basic_material LIKE ?)');
            const q = `%${query}%`;
            params.push(q, q, q, q);
        }
        if (spareName) {
            whereClauses.push('spare_name LIKE ?');
            params.push(`%${spareName}%`);
        }
        if (partNo) {
            whereClauses.push('part_no LIKE ?');
            params.push(`%${partNo}%`);
        }
        if (sapMaterial) {
            whereClauses.push('sap_material LIKE ?');
            params.push(`%${sapMaterial}%`);
        }
        if (pumpCategory) {
            whereClauses.push('pump_category = ?');
            params.push(pumpCategory);
        }
        if (pumpType) {
            whereClauses.push('pump_type = ?');
            params.push(pumpType);
        }
        if (pumpSize) {
            whereClauses.push('pump_size = ?');
            params.push(pumpSize);
        }
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM spare_price_search ${whereSql}`;
    const [countRes] = await pool.query(countSql, params);
    const total = countRes[0].total;

    const dataSql = `
        SELECT
            id,
            pump_category,
            pump_type,
            pump_size,
            spare_name,
            basic_material,
            part_no,
            sap_material,
            unit_price,
            uom,
            last_synced_at
        FROM spare_price_search
        ${whereSql}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(dataSql, [...params, parsedLimit, offset]);

    return {
        data: rows,
        pagination: {
            total,
            page: parseInt(page),
            limit: parsedLimit,
            totalPages: Math.ceil(total / parsedLimit) || 1
        }
    };
}

/**
 * Get distinct pump dropdown options for cascading filters.
 */
async function getPumpOptions(filters = {}) {
    await ensureTableExists();
    const { pumpCategory = '', pumpType = '' } = filters;

    const [categories] = await pool.query('SELECT DISTINCT pump_category FROM spare_price_search ORDER BY pump_category');

    let typeSql = 'SELECT DISTINCT pump_type FROM spare_price_search';
    let typeParams = [];
    if (pumpCategory) {
        typeSql += ' WHERE pump_category = ?';
        typeParams.push(pumpCategory);
    }
    typeSql += ' ORDER BY pump_type';
    const [types] = await pool.query(typeSql, typeParams);

    let sizeSql = 'SELECT DISTINCT pump_size FROM spare_price_search';
    let sizeWhere = [];
    let sizeParams = [];
    if (pumpCategory) {
        sizeWhere.push('pump_category = ?');
        sizeParams.push(pumpCategory);
    }
    if (pumpType) {
        sizeWhere.push('pump_type = ?');
        sizeParams.push(pumpType);
    }
    if (sizeWhere.length > 0) {
        sizeSql += ' WHERE ' + sizeWhere.join(' AND ');
    }
    sizeSql += ' ORDER BY pump_size';
    const [sizes] = await pool.query(sizeSql, sizeParams);

    return {
        categories: categories.map(c => c.pump_category).filter(Boolean),
        types: types.map(t => t.pump_type).filter(Boolean),
        sizes: sizes.map(s => s.pump_size).filter(Boolean)
    };
}

module.exports = {
    ensureTableExists,
    upsertSpare,
    bulkSyncSpares,
    searchSpares,
    getPumpOptions
};
