const enquiryModel = require('../models/enquiryModel');
const { STRING_HIDDEN } = require('../utils/constants');

// List enquiries (optionally filtered)
async function listEnquiries(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const { enquiryDate, linkedJobNumber } = req.query;
        let enquiries = await enquiryModel.getAllEnquiries({ enquiryDate, linkedJobNumber });
        if (hideSensitive) {
            enquiries = enquiries.map(enquiry => ({
                "EnquiryId": enquiry.EnquiryId,
                "EnquiryDate": STRING_HIDDEN,
                "CustomerName": STRING_HIDDEN,
                "ContactNumber": STRING_HIDDEN,
                "NatureOfQuery": STRING_HIDDEN,
                "QueryDetails": STRING_HIDDEN,
                "NextFollowUpDate": STRING_HIDDEN,
                "FollowUpNotes": STRING_HIDDEN,
                "EnteredBy": STRING_HIDDEN,
                "LinkedJobNumber": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN
            }))
        }
        res.json(enquiries);
    } catch (err) {
        next(err);
    }
}

// Get enquiry by ID
async function getEnquiry(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let enquiry = await enquiryModel.getEnquiryById(req.params.enquiryId);
        if (!enquiry) return res.status(404).json({ error: 'Enquiry not found' });
        if (hideSensitive) {
            enquiry = {
                "EnquiryId": enquiry.EnquiryId,
                "EnquiryDate": STRING_HIDDEN,
                "CustomerName": STRING_HIDDEN,
                "ContactNumber": STRING_HIDDEN,
                "NatureOfQuery": STRING_HIDDEN,
                "QueryDetails": STRING_HIDDEN,
                "NextFollowUpDate": STRING_HIDDEN,
                "FollowUpNotes": STRING_HIDDEN,
                "EnteredBy": STRING_HIDDEN,
                "LinkedJobNumber": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN
            };
        }
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