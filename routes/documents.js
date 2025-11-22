const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const constants = require('../utils/constants');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Protected routes - Admin and Owner only to create/delete documents
router.post('/', authenticateToken, authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER), documentController.createDocument);
router.delete('/:id', authenticateToken, authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER), documentController.deleteDocument);

// Customers and Admin/Owner can view documents
router.get('/job/:jobNumber', authenticateToken, documentController.getDocumentsByJob);
router.get('/customer/:customerId', authenticateToken, documentController.getDocumentsByCustomer);

module.exports = router;