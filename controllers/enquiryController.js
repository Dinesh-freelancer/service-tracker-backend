const enquiryModel = require('../models/enquiryModel');

// List enquiries (optionally filtered)
async function listEnquiries(req, res, next) {
    try {
        const { enquiryDate, linkedJobNumber } = req.query;
        const enquiries = await enquiryModel.getAllEnquiries({ enquiryDate, linkedJobNumber });
        res.json(enquiries);
    } catch (err) {
        next(err);
    }
}

// Get enquiry by ID
async function getEnquiry(req, res, next) {
    try {
        const enquiry = await enquiryModel.getEnquiryById(req.params.enquiryId);
        if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
        res.json(enquiry);
    } catch (err) {
        next(err);
    }
}

// Add a new enquiry
async function createEnquiry(req, res, next) {
    try {
        const enquiry = await enquiryModel.addEnquiry(req.body);
        res.status(201).json(enquiry);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listEnquiries,
    getEnquiry,
    createEnquiry
};