const express = require('express');
const router = express.Router();
const warrantyClaimController = require('../controllers/warrantyClaimController');
const auth = require('../middleware/auth');
const { authorizeRoles, AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER } = require('../middleware/authorize');

router.get('/:jobNumber', auth, authorizeRoles(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), warrantyClaimController.getClaim);
router.put('/:jobNumber', auth, authorizeRoles(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), warrantyClaimController.updateClaim);

module.exports = router;
