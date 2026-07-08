const pool = require('../db');

async function getAllAnnexures() {
    const [rows] = await pool.query('SELECT * FROM annexure ORDER BY PostDate DESC');
    return rows;
}

async function getAnnexureById(annexNumber) {
    const [rows] = await pool.query('SELECT * FROM annexure WHERE AnnexNumber = ?', [annexNumber]);
    return rows[0];
}

async function createAnnexure(annexureData) {
    const fields = Object.keys(annexureData);
    const values = Object.values(annexureData);
    const placeholders = fields.map(() => '?').join(', ');

    await pool.query(
        `INSERT INTO annexure (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return annexureData.AnnexNumber;
}

async function updateAnnexure(annexNumber, annexureData) {
    const fields = Object.keys(annexureData).map(field => `${field} = ?`);
    const values = Object.values(annexureData);
    values.push(annexNumber);

    const [result] = await pool.query(
        `UPDATE annexure SET ${fields.join(', ')} WHERE AnnexNumber = ?`,
        values
    );
    return result.affectedRows;
}

async function deleteAnnexure(annexNumber) {
    const [result] = await pool.query('DELETE FROM annexure WHERE AnnexNumber = ?', [annexNumber]);
    return result.affectedRows;
}

module.exports = {
    getAllAnnexures,
    getAnnexureById,
    createAnnexure,
    updateAnnexure,
    deleteAnnexure
};
