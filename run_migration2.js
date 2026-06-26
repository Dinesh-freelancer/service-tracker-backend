const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
  const connectionConfig = {
      host: '127.0.0.1',
      user: 'root',
      password: 'root',
      multipleStatements: true,
      database: 'service_db'
  };

  try {
    const connection = await mysql.createConnection(connectionConfig);
    const sql = fs.readFileSync('apps/api/migrations/rename_hp_and_add_power_unit.sql', 'utf8');
    await connection.query(sql);
    console.log("Migration successful");
    await connection.end();
  } catch (e) {
    console.error("Migration failed:", e);
  }
}
run();
