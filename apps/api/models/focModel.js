const pool = require('../db');

async function getAllClaims(filters = {}) {
    let query = 'SELECT * FROM free_of_cost_claims';
    let params = [];
    let whereClauses = [];

    if (filters.status) {
        whereClauses.push('ClaimStatus = ?');
        params.push(filters.status);
    }
    if (filters.jobNumber) {
        whereClauses.push('JobNumber = ?');
        params.push(filters.jobNumber);
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY Id DESC';

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getClaimById(id) {
    const [rows] = await pool.query('SELECT * FROM free_of_cost_claims WHERE Id = ?', [id]);
    return rows[0];
}

async function createClaim(claimData) {
    // Filter out undefined values but keep nulls
    const filteredData = Object.entries(claimData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO free_of_cost_claims (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return result.insertId;
}

async function updateClaim(id, claimData) {
    // Filter out undefined values but keep nulls
    const filteredData = Object.entries(claimData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});

    const fields = Object.keys(filteredData).map(field => `${field} = ?`);
    const values = Object.values(filteredData);
    values.push(id);

    const [result] = await pool.query(
        `UPDATE free_of_cost_claims SET ${fields.join(', ')} WHERE Id = ?`,
        values
    );
    return result.affectedRows;
}

async function deleteClaim(id) {
    const [result] = await pool.query('DELETE FROM free_of_cost_claims WHERE Id = ?', [id]);
    return result.affectedRows;
}

module.exports = {
    getAllClaims,
    getClaimById,
    createClaim,
    updateClaim,
    deleteClaim
};
