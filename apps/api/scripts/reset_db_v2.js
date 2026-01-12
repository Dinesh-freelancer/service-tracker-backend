const fs = require('fs');
const path = require('path');
const pool = require('../db');

async function resetDatabase() {
  try {
    const sqlPath = path.join(__dirname, '../../../Tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Reading Tables.sql...');

    // Split SQL into individual statements, respecting Delimiters
    // Simple regex splitting by ';' is risky with triggers containing ';'
    // We will assume the file is well-structured and try executing standard statements first,
    // then handle triggers separately if needed, or use a robust splitter.

    // However, mysql2 supports multiple statements if configured.
    // Let's rely on mysql2 multipleStatements: true (which is typically enabled in db.js or needs to be).
    // If not, we iterate.

    // Checking db.js... (I can't see it but usually pool is configured)
    // To be safe, let's try to parse it somewhat intelligently or just run it as a big block if multi-statements are on.

    // BUT, the file contains DELIMITER // which is a client-side (MySQL Workbench/CLI) command, not server-side SQL.
    // We must preprocess this.

    const statements = [];
    let currentStatement = '';
    let delimiter = ';';

    const lines = sql.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith('DELIMITER')) {
            delimiter = trimmed.split(' ')[1];
            continue;
        }

        if (trimmed.startsWith('--') || trimmed === '') {
            continue;
        }

        currentStatement += line + '\n';

        if (currentStatement.trim().endsWith(delimiter)) {
            // Remove the delimiter from the end
            let stmt = currentStatement.trim();
            stmt = stmt.substring(0, stmt.length - delimiter.length);

            if (stmt.trim()) {
                statements.push(stmt);
            }
            currentStatement = '';
        }
    }

    console.log(`Found ${statements.length} statements.`);

    const connection = await pool.getConnection();

    try {
        // Disable FK checks to allow dropping/recreating in any order (though script handles it)
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop existing tables first to ensure clean state?
        // The script has CREATE TABLE IF NOT EXISTS.
        // User asked for "Wipe", so we should DROP.
        // Let's fetch all tables and drop them.
        const [tables] = await connection.query("SHOW TABLES");
        if (tables.length > 0) {
            console.log(`Dropping ${tables.length} existing tables...`);
            const tableNames = tables.map(t => Object.values(t)[0]).join('`, `');
            await connection.query(`DROP TABLE IF EXISTS \`${tableNames}\``);
        }

        // Run statements
        for (const stmt of statements) {
             // Skip empty statements
             if (!stmt.trim()) continue;

             // Handle client-side variables or known issues?
             // The script sets @variables, which is fine in session.

             await connection.query(stmt);
        }

        console.log('Database reset successfully.');

    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        connection.release();
        process.exit();
    }

  } catch (err) {
    console.error('Failed to read SQL file or connect:', err);
    process.exit(1);
  }
}

resetDatabase();
