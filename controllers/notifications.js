const Notification = require('../models/notificationModel');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');

exports.getNotifications = async (req, res, next) => {
    try {
        const userId = req.user.UserId;
        // getPagination expects 'req' object with query params
        const { page, limit, offset } = getPagination(req);
        const unreadOnly = req.query.unreadOnly === 'true';

        const { notifications, total } = await Notification.getByUser(userId, limit, offset, unreadOnly);

        // getPaginationData(data, page, limit, totalItems)
        const response = getPaginationData(notifications, page, limit, total);

        res.json(response);
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.UserId;
        const notificationId = req.params.id;

        const success = await Notification.markAsRead(notificationId, userId);
        if (!success) {
            return res.status(404).json({ message: 'Notification not found or already read' });
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.UserId;
        const count = await Notification.markAllAsRead(userId);
        res.json({ message: `All notifications marked as read`, count });
    } catch (error) {
        next(error);
    }
};
