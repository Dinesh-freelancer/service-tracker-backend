const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const constants = require('../utils/constants');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// Protected routes - Admin and Owner only to create/delete documents
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.createDocument);
router.delete('/:id',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.deleteDocument);

// Customers and Admin/Owner can view documents
router.get('/job/:jobNumber',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.getDocumentsByJob);
router.get('/customer/:customerId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    documentController.getDocumentsByCustomer);

module.exports = router;