const pool = require('../db');

// Get all winding details (usually filtered by job, but controller might ask for all)
async function getAllWindingDetails() {
    const [rows] = await pool.query('SELECT * FROM windingdetails');
    return rows;
}

// Get winding details for a specific job
async function getWindingDetailsByJobNumber(jobNumber) {
    // We might join with ServiceRequest to get JobStatus if needed for visibility check
    const [rows] = await pool.query(
        `SELECT wd.*, sr.Status as JobStatus
         FROM windingdetails wd
         JOIN servicerequest sr ON wd.jobNumber = sr.JobNumber
         WHERE wd.jobNumber = ?`,
         [jobNumber]
    );
    return rows;
}

async function addWindingDetail(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO windingdetails (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return result.insertId;
}

async function updateWindingDetail(id, data) {
    const fields = Object.keys(data).map(field => `${field} = ?`);
    const values = Object.values(data);
    values.push(id);

    await pool.query(
        `UPDATE windingdetails SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
}

async function deleteWindingDetail(id) {
    await pool.query('DELETE FROM windingdetails WHERE id = ?', [id]);
}

module.exports = {
    getAllWindingDetails,
    getWindingDetailsByJobNumber,
    addWindingDetail,
    updateWindingDetail,
    deleteWindingDetail
};
