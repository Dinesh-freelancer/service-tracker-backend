const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');

router.use(authenticateToken);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];

router.get('/', authorize(...ADMIN_OWNER), organizationController.getAllOrganizations);
router.post('/', authorize(...ADMIN_OWNER), organizationController.createOrganization);

module.exports = router;
