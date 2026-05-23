const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');

router.use(authenticateToken);

// Owner-only endpoints for global settings
router.get('/', authorize(constants.AUTH_ROLE_OWNER), settingsController.getSettings);
router.post('/', authorize(constants.AUTH_ROLE_OWNER), settingsController.updateSettings);

module.exports = router;
