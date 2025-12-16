const pool = require('../db');

// Get all enquiries (optionally filter by date or linked job)
async function getAllEnquiries({ enquiryDate, linkedJobNumber } = {}) {
    let query = 'SELECT * FROM Enquiry WHERE 1=1';
    const params = [];
    if (enquiryDate) {
        query += ' AND EnquiryDate = ?';
        params.push(enquiryDate);
    }
    if (linkedJobNumber) {
        query += ' AND LinkedJobNumber = ?';
        params.push(linkedJobNumber);
    }
    query += ' ORDER BY EnquiryDate DESC';

    const [rows] = await pool.query(query, params);
    return rows;
}

// Get enquiry by ID
async function getEnquiryById(enquiryId) {
    const [rows] = await pool.query('SELECT * FROM Enquiry WHERE EnquiryId = ?', [enquiryId]);
    return rows[0];
}

// Add new enquiry
async function addEnquiry(data) {
    const {
        EnquiryDate,
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
        `INSERT INTO Enquiry (
      EnquiryDate, CustomerName, ContactNumber, NatureOfQuery,
      QueryDetails, NextFollowUpDate, FollowUpNotes, EnteredBy, LinkedJobNumber
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            EnquiryDate,
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

    return await getEnquiryById(result.insertId);
}

module.exports = {
    getAllEnquiries,
    getEnquiryById,
    addEnquiry
};