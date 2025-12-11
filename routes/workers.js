const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const workerController = require('../controllers/workerController');
const sensitiveInfoToggle = require('../middleware/sensitiveInfoToggle');
router.use(authenticateToken);
router.use(sensitiveInfoToggle);
// GET /api/workers
// Users: Admins and Owners
router.get('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.listWorkers);

// GET /api/workers/:workerId
// Users: Admins and Owners
router.get('/:workerId',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.getWorker);

// POST /api/workers
// Users: Admins and Owners
router.post('/',
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.createWorker);

module.exports = router;