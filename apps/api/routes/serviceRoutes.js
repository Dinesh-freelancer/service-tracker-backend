const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER } = require('../utils/constants');

router.use(authenticateToken);

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), serviceController.createService);
router.put('/:id', authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), serviceController.updateService);
router.delete('/:id', authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), serviceController.deleteService);

module.exports = router;
