const pool = require('../db');

async function addDocument(data) {
    const { JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy } = data;
    const [result] = await pool.query(
        `INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy)
     VALUES (?, ?, ?, ?, ?)`, [JobNumber || null, CustomerId || null, DocumentType, EmbedTag, CreatedBy]
    );
    return getDocumentById(result.insertId);
}

async function getDocumentById(id) {
    const [rows] = await pool.query('SELECT * FROM documents WHERE DocumentId = ?', [id]);
    return rows[0];
}

async function getDocumentsByJob(jobNumber) {
    const [rows] = await pool.query(
        `SELECT * FROM documents WHERE JobNumber = ? ORDER BY CreatedAt DESC`, [jobNumber]
    );
    return rows;
}

async function getDocumentsByCustomer(customerId) {
    const [rows] = await pool.query(
        `SELECT * FROM documents WHERE CustomerId = ? ORDER BY CreatedAt DESC`, [customerId]
    );
    return rows;
}

async function deleteDocument(id) {
    await pool.query('DELETE FROM documents WHERE DocumentId = ?', [id]);
}

module.exports = {
    addDocument,
    getDocumentById,
    getDocumentsByJob,
    getDocumentsByCustomer,
    deleteDocument
};