const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../routes/notifications');

// Mock dependencies
jest.mock('../db', () => ({
    query: jest.fn(),
    execute: jest.fn()
}));
jest.mock('../middleware/authMiddleware', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { UserId: 1, Role: 'Admin' };
        next();
    }
}));

const pool = require('../db');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);

describe('Notifications API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/notifications', () => {
        it('should return paginated list of notifications', async () => {
            // Mock DB response for getByUser
            pool.query.mockResolvedValueOnce([
                [{ NotificationId: 1, Title: 'Test Notification' }], // rows
                [] // fields
            ]);
            // Mock count query
            pool.query.mockResolvedValueOnce([
                [{ total: 1 }],
                []
            ]);

            const res = await request(app).get('/api/notifications');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.data[0].Title).toBe('Test Notification');
        });
    });

    describe('PUT /api/notifications/:id/read', () => {
        it('should mark a notification as read', async () => {
            // Mock update query
            pool.query.mockResolvedValueOnce([
                { affectedRows: 1 },
                []
            ]);

            const res = await request(app).put('/api/notifications/1/read');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Notification marked as read');
        });

        it('should return 404 if notification not found', async () => {
            pool.query.mockResolvedValueOnce([
                { affectedRows: 0 },
                []
            ]);

            const res = await request(app).put('/api/notifications/999/read');

            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/notifications/read-all', () => {
        it('should mark all notifications as read', async () => {
            pool.query.mockResolvedValueOnce([
                { affectedRows: 5 },
                []
            ]);

            const res = await request(app).put('/api/notifications/read-all');

            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(5);
        });
    });
});
