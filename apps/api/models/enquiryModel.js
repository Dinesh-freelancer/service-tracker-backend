const pool = require('../db');

// Get all enquiries (optionally filter by date or linked job)
async function getAllEnquiries({ enquiryDate, linkedJobNumber } = {}) {
    let query = 'SELECT * FROM enquiry WHERE 1=1';
    const params = [];
    if (enquiryDate) {
        query += ' AND enquiryDate = ?';
        params.push(enquiryDate);
    }
    if (linkedJobNumber) {
        query += ' AND LinkedJobNumber = ?';
        params.push(linkedJobNumber);
    }
    query += ' ORDER BY enquiryDate DESC';

    const [rows] = await pool.query(query, params);
    return rows;
}

// Get enquiry by ID
async function getenquiryById(enquiryId) {
    const [rows] = await pool.query('SELECT * FROM enquiry WHERE enquiryId = ?', [enquiryId]);
    return rows[0];
}

// Add new enquiry
async function addenquiry(data) {
    const {
        enquiryDate,
        CustomerName,
        ContactNumber,
        NatureOfQuery,
        QueryDetails,
        NextFollowUpDate,
        FollowUpNotes,
        EnteredBy,
        LinkedJobNumber
    } = data;

    const [result] = await pool.query(
        `INSERT INTO enquiry (
      enquiryDate, CustomerName, ContactNumber, NatureOfQuery,
      QueryDetails, NextFollowUpDate, FollowUpNotes, EnteredBy, LinkedJobNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            enquiryDate,
            CustomerName,
            ContactNumber,
            NatureOfQuery,
            QueryDetails,
            NextFollowUpDate,
            FollowUpNotes,
            EnteredBy,
            LinkedJobNumber || null
        ]
    );

    return await getenquiryById(result.insertId);
}

module.exports = {
    getAllEnquiries,
    getenquiryById,
    addenquiry
};