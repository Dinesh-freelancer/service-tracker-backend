const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const enquiryController = require('../controllers/enquiryController');

// GET /api/enquiries
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    enquiryController.listEnquiries);

// GET /api/enquiries/:enquiryId
// Users: Admins and Owners
router.get('/:enquiryId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    enquiryController.getEnquiry);

// POST /api/enquiries
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    enquiryController.createEnquiry);

module.exports = router;