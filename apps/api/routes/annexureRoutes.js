const express = require('express');
const router = express.Router();
const annexureController = require('../controllers/annexureController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(authorize('Admin', 'Owner'));

router.get('/', annexureController.getAllAnnexures);
router.get('/:id', annexureController.getAnnexure);
router.post('/', annexureController.createAnnexure);
router.put('/:id', annexureController.updateAnnexure);
router.delete('/:id', annexureController.deleteAnnexure);

module.exports = router;
