const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const partsUsedController = require('../controllers/partsUsedController');

// GET /api/partsused?jobNumber=...
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    partsUsedController.listPartsUsed);

// GET /api/partsused/:partUsedId
// Users: Admins and Owners
router.get('/:partUsedId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    partsUsedController.getPartUsed);

// POST /api/partsused
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    partsUsedController.createPartUsed);

module.exports = router;