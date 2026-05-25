const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const salesItemController = require('../controllers/salesItemController');

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];

/**
 * @swagger
 * tags:
 *   name: SalesItems
 *   description: Sales portfolio items
 */

// Public routes
router.get('/', salesItemController.listSalesItems);
router.get('/:id', salesItemController.getSalesItem);

// Protected routes for Owners
router.post('/', authenticateToken, authorize(constants.AUTH_ROLE_OWNER), salesItemController.createSalesItem);
router.put('/:id', authenticateToken, authorize(constants.AUTH_ROLE_OWNER), salesItemController.updateSalesItem);
router.delete('/:id', authenticateToken, authorize(constants.AUTH_ROLE_OWNER), salesItemController.deleteSalesItem);

module.exports = router;
