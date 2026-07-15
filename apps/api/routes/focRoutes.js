const express = require('express');
const router = express.Router();
const focController = require('../controllers/focController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// FOC Claims should typically be accessible to Admin and Owner roles
router.use(authenticateToken);
router.use(authorize('Admin', 'Owner'));

router.get('/', focController.getAllClaims);
router.get('/:id', focController.getClaim);
router.post('/', focController.createClaim);
router.put('/:id', focController.updateClaim);
router.delete('/:id', focController.deleteClaim);

module.exports = router;
