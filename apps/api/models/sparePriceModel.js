const pool = require('../db');

/**
 * Upserts a spare part record.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to ensure idempotency and atomic updates.
 * @param {Object} spareData - The validated spare part object.
 * @returns {Promise<Object>} - The result of the query.
 */
async function upsertSpare(spareData) {
    const {
        pumpCategory,
        pumpType,
        pumpSize,
        spareName,
        basicMaterial,
        partNo,
        sapMaterial,
        unitPrice,
        uom
    } = spareData;

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
        partNo || null,
        sapMaterial || null,
        unitPrice,
        uom
    ];

    const [result] = await pool.query(sql, values);
    return result;
}

module.exports = {
    upsertSpare
};
