const express = require('express');
const router = express.Router();
const controller = require('../controllers/windingDetailsController');
const constants = require('../utils/constants');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Admin/Owner can create/update/delete; all roles can view
router.get('/', authenticateToken, controller.getAllWindingDetails);
router.get('/job/:jobNumber', authenticateToken, controller.getByJobNumber);

router.post('/', authenticateToken, authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER), controller.createWindingDetail);
router.put('/:id', authenticateToken, authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER), controller.updateWindingDetail);
router.delete('/:id', authenticateToken, authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER), controller.deleteWindingDetail);

module.exports = router;