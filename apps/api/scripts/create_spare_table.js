
const pool = require('../db');

async function createTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS spare_price_search (
              id BIGINT AUTO_INCREMENT PRIMARY KEY,
              pump_category VARCHAR(50) NOT NULL,
              pump_type VARCHAR(120) NOT NULL,
              pump_size VARCHAR(50) NOT NULL,
              spare_name VARCHAR(200) NOT NULL,
              basic_material VARCHAR(150) NOT NULL,
              part_no VARCHAR(100),
              sap_material VARCHAR(100),
              unit_price DECIMAL(12,2) NOT NULL,
              uom VARCHAR(20) NOT NULL,
              last_synced_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY uq_spare (pump_category, pump_type, pump_size, spare_name, basic_material),
              INDEX idx_spare_name (spare_name),
              INDEX idx_part_no (part_no),
              INDEX idx_pump (pump_category, pump_type, pump_size),
              INDEX idx_price (unit_price)
            );
        `);
        console.log('Table spare_price_search created or already exists.');
    } catch (error) {
        console.error('Error creating table:', error);
    } finally {
        process.exit();
    }
}

createTable();
