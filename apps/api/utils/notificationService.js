const Notification = require('../models/notificationModel');
const db = require('../db');

const NotificationService = {
    // Notify a specific user
    notifyUser: async (userId, type, title, message, referenceId = null) => {
        try {
            await Notification.create({ userId, type, title, message, referenceId });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }
    },

    // Notify all Admins and Owners
    notifyAdminsAndOwners: async (type, title, message, referenceId = null) => {
        try {
            const [users] = await db.query(`SELECT UserId FROM users WHERE Role IN ('Admin', 'Owner') AND IsActive = 1`);
            for (const user of users) {
                await Notification.create({ userId: user.UserId, type, title, message, referenceId });
            }
        } catch (error) {
            console.error('Failed to notify admins:', error);
        }
    },

    // Notify the worker assigned to a job
    notifyAssignedWorker: async (workerId, type, title, message, referenceId = null) => {
        try {
            // Find the UserID associated with this WorkerID
            const [users] = await db.query(`SELECT UserId FROM users WHERE WorkerId = ? AND IsActive = 1`, [workerId]);
            if (users.length > 0) {
                await Notification.create({ userId: users[0].UserId, type, title, message, referenceId });
            }
        } catch (error) {
            console.error('Failed to notify worker:', error);
        }
    }
};

module.exports = NotificationService;
