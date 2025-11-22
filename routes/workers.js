const express = require('express');
const router = express.Router();
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const constants = require('../utils/constants');
const workerController = require('../controllers/workerController');

// GET /api/workers
// Users: Admins and Owners
router.get('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.listWorkers);

// GET /api/workers/:workerId
// Users: Admins and Owners
router.get('/:workerId',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.getWorker);

// POST /api/workers
// Users: Admins and Owners
router.post('/',
    authenticateToken,
    authorize(constants.AUTH_ROLE_ADMIN, constants.AUTH_ROLE_OWNER),
    workerController.createWorker);

module.exports = router;