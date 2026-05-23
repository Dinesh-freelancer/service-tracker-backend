const pool = require('../db');

async function getAllSettings() {
    const [rows] = await pool.query('SELECT * FROM settings');
    const settings = {};
    rows.forEach(row => {
        settings[row.SettingKey] = row.SettingValue;
    });
    return settings;
}

async function getSetting(key) {
    const [rows] = await pool.query('SELECT SettingValue FROM settings WHERE SettingKey = ?', [key]);
    if (rows.length > 0) return rows[0].SettingValue;
    return null;
}

async function updateSetting(key, value) {
    const query = `
        INSERT INTO settings (SettingKey, SettingValue)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE SettingValue = VALUES(SettingValue)
    `;
    await pool.query(query, [key, value]);
}

async function bulkUpdateSettings(settingsObj) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const query = `
            INSERT INTO settings (SettingKey, SettingValue)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE SettingValue = VALUES(SettingValue)
        `;
        for (const [key, value] of Object.entries(settingsObj)) {
            await connection.query(query, [key, value]);
        }
        await connection.commit();
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

module.exports = {
    getAllSettings,
    getSetting,
    updateSetting,
    bulkUpdateSettings
};
