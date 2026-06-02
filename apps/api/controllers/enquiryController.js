const enquiryModel = require('../models/enquiryModel');
const notificationModel = require('../models/notificationModel');
const userModel = require('../models/userModel');
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
        const enquiryId = await enquiryModel.addEnquiry(req.body);
        const enquiry = await enquiryModel.getEnquiryById(enquiryId);

        // If this is a public sales enquiry (no token), or even if it's internal,
        // notify the Owners.
        if (req.body.NatureOfQuery === 'Sales item enquiry') {
            const users = await userModel.getAllUsers();
            const owners = users.filter(u => u.Role === 'Owner');
            for (const owner of owners) {
                await notificationModel.create({
                    userId: owner.UserId,
                    type: 'System', // Must be one of: 'JobUpdate','LowStock','Payment','System','JobAssignment'
                    title: 'New Sales Enquiry',
                    message: `New sales enquiry received from ${req.body.CustomerName} (${req.body.ContactNumber}).`,
                    referenceId: enquiryId.toString()
                });
            }
        }

        res.status(201).json(enquiry);
    } catch (err) {
        next(err);
    }
}

// Update an existing enquiry
async function updateEnquiry(req, res, next) {
    try {
        const { enquiryId } = req.params;
        const updateData = req.body;

        // Remove identifying or readonly fields if they exist
        if (updateData.EnquiryId) delete updateData.EnquiryId;
        if (updateData.CreatedAt) delete updateData.CreatedAt;

        await enquiryModel.updateEnquiry(enquiryId, updateData);

        const updatedEnquiry = await enquiryModel.getEnquiryById(enquiryId);
        res.json(updatedEnquiry);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listEnquiries,
    getEnquiry,
    createEnquiry,
    updateEnquiry
};