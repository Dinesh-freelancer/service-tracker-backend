const express = require('express');
const router = express.Router();
const warrantyClaimController = require('../controllers/warrantyClaimController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER } = require('../utils/constants');

router.get('/:jobNumber', authenticateToken, authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), warrantyClaimController.getClaim);
router.put('/:jobNumber', authenticateToken, authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), warrantyClaimController.updateClaim);

module.exports = router;
