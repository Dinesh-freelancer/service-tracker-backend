const db = require('../db');

const Notification = {
    // Create a new notification
    create: async ({ userId, type, title, message, referenceId }) => {
        const query = `
            INSERT INTO notifications (UserId, Type, Title, Message, ReferenceId)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [userId, type, title, message, referenceId]);
        return result.insertId;
    },

    // Get notifications for a user (paginated)
    getByUser: async (userId, limit = 20, offset = 0, unreadOnly = false) => {
        let query = `
            SELECT * FROM notifications
            WHERE UserId = ?
        `;
        const params = [userId];

        if (unreadOnly) {
            query += ` AND IsRead = 0`;
        }

        query += ` ORDER BY CreatedAt DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await db.query(query, params);

        // Get total count for pagination
        let countQuery = `SELECT COUNT(*) as total FROM notifications WHERE UserId = ?`;
        const countParams = [userId];
        if (unreadOnly) {
            countQuery += ` AND IsRead = 0`;
        }
        const [countResult] = await db.query(countQuery, countParams);

        return {
            notifications: rows,
            total: countResult[0].total
        };
    },

    // Mark a specific notification as read
    markAsRead: async (notificationId, userId) => {
        const query = `
            UPDATE notifications
            SET IsRead = 1
            WHERE NotificationId = ? AND UserId = ?
        `;
        const [result] = await db.query(query, [notificationId, userId]);
        return result.affectedRows > 0;
    },

    // Mark all notifications as read for a user
    markAllAsRead: async (userId) => {
        const query = `
            UPDATE notifications
            SET IsRead = 1
            WHERE UserId = ? AND IsRead = 0
        `;
        const [result] = await db.query(query, [userId]);
        return result.affectedRows;
    },

    // Delete old notifications (maintenance)
    deleteOld: async (days = 30) => {
        const query = `
            DELETE FROM notifications
            WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const [result] = await db.query(query, [days]);
        return result.affectedRows;
    }
};

module.exports = Notification;
