const pool = require('../db');

// Get documents with optional filters
async function getDocuments(filters) {
    let query = 'SELECT * FROM documents';
    let params = [];
    let whereClauses = [];

    if (filters.jobNumber) {
        whereClauses.push('JobNumber = ?');
        params.push(filters.jobNumber);
    }

    if (filters.customerId) {
        whereClauses.push('CustomerId = ?');
        params.push(filters.customerId);
    }

    if (filters.documentType) {
        whereClauses.push('DocumentType = ?');
        params.push(filters.documentType);
    }

    if (whereClauses.length > 0) {
        const whereSql = ' WHERE ' + whereClauses.join(' AND ');
        query += whereSql;
    }

    const [rows] = await pool.query(query, params);
    return rows;
}

// Aliases for specific controller calls
async function getDocumentsByJob(jobNumber) {
    return getDocuments({ jobNumber });
}

async function getDocumentsByCustomer(customerId) {
    return getDocuments({ customerId });
}

async function addDocument(docData) {
    const fields = Object.keys(docData);
    const values = Object.values(docData);
    const placeholders = fields.map(() => '?').join(', ');

    const [result] = await pool.query(
        `INSERT INTO documents (${fields.join(', ')}) VALUES (${placeholders})`,
        values
    );
    return result.insertId;
}

async function deleteDocument(documentId) {
    await pool.query('DELETE FROM documents WHERE DocumentId = ?', [documentId]);
}

module.exports = {
    getDocuments,
    getDocumentsByJob,
    getDocumentsByCustomer,
    addDocument,
    deleteDocument
};
