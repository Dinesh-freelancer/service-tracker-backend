const pool = require('./apps/api/db.js');
(async () => {
    try {
        const [rows] = await pool.query("DESCRIBE assets;");
        console.table(rows);
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
})();
