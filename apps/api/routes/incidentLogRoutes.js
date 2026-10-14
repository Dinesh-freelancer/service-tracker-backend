const express = require('express');
const router = express.Router();
const incidentLogController = require('../controllers/incidentLogController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER } = require('../utils/constants');

router.use(authenticateToken);
router.use(authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER));

router.get('/', incidentLogController.getAllIncidentLogs);
router.get('/:id', incidentLogController.getIncidentLogById);
router.post('/', incidentLogController.createIncidentLog);
router.put('/:id', incidentLogController.updateIncidentLog);
router.delete('/:id', incidentLogController.deleteIncidentLog);

module.exports = router;
