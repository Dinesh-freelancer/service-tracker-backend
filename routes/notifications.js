const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken); // All routes require authentication

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
