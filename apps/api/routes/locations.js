const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const locationController = require('../controllers/locationController');

router.use(authenticateToken);

const ADMIN_OWNER = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER];
const WORKER_ALLOWED = [constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER, constants.AUTH_ROLE_WORKER];

router.get('/', authorize(...WORKER_ALLOWED), locationController.listLocations);
router.get('/:locationId', authorize(...WORKER_ALLOWED), locationController.getLocation);
router.post('/', authorize(...ADMIN_OWNER), locationController.createLocation);
router.put('/:locationId', authorize(...ADMIN_OWNER), locationController.updateLocation);
router.delete('/:locationId', authorize(...ADMIN_OWNER), locationController.deleteLocation);

module.exports = router;
