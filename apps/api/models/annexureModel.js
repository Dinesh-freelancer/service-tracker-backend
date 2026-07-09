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
    // Filter out undefined values but keep nulls
    const filteredData = Object.entries(annexureData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map(() => '?').join(', ');

    await pool.query(
        `INSERT INTO annexure (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return annexureData.AnnexNumber;
}

async function updateAnnexure(annexNumber, annexureData) {
    // Filter out undefined values but keep nulls
    const filteredData = Object.entries(annexureData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const fields = Object.keys(filteredData).map(field => `${field} = ?`);
    const values = Object.values(filteredData);
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
