const pool = require('./apps/api/db');
async function run() {
  try {
    await pool.query("ALTER TABLE enquiry ADD COLUMN Status VARCHAR(50) DEFAULT 'New'");
    console.log("Status column added.");
  } catch (e) {
    console.log("Error:", e.message);
  } finally {
    process.exit(0);
  }
}
run();
