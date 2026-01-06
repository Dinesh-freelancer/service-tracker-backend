const request = require('supertest');
const express = require('express');
const jobRoutes = require('../routes/jobs');

// Mock Connection Object
const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
    query: jest.fn()
};

// Mock dependencies
jest.mock('../db', () => ({
    query: jest.fn(),
    execute: jest.fn(),
    getConnection: jest.fn(() => Promise.resolve(mockConnection))
}));
jest.mock('../middleware/authMiddleware', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { UserId: 1, Role: 'Admin' };
        next();
    },
    authorize: (...roles) => (req, res, next) => next()
}));
jest.mock('../middleware/sensitiveInfoToggle', () => (req, res, next) => next());
jest.mock('../utils/auditLogger', () => ({
    logAudit: jest.fn()
}));

const pool = require('../db');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobRoutes);

describe('Jobs API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset pool query default
        pool.query.mockResolvedValue([ [], [] ]);
        // Reset connection query default
        mockConnection.query.mockResolvedValue([ [], [] ]);
    });

    describe('GET /api/jobs', () => {
        it('should return paginated list of jobs', async () => {
            // Mock DB response (pool.query used for list)
            pool.query.mockResolvedValueOnce([
                [{ JobNumber: 'JOB123', InternalTag: 'TAG1', PumpBrand: 'P1' }], // rows
                [] // fields
            ]);
            // Mock count query
            pool.query.mockResolvedValueOnce([
                [{ count: 1 }],
                []
            ]);

            const res = await request(app).get('/api/jobs');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data[0].JobNumber).toBe('JOB123');
        });
    });

    describe('POST /api/jobs', () => {
        it('should create a job with an Existing AssetId', async () => {
            // Transaction Sequence on CONNECTION
            // 1. Generate Job Number
            mockConnection.query.mockResolvedValueOnce([ [], [] ]);

            // 2. Insert ServiceRequest
            mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]);

            // 3. getServiceRequest call after creation
            mockConnection.query.mockResolvedValueOnce([
                [{ JobNumber: '20231010001', AssetId: 100 }],
                []
            ]);

            const payload = {
                CustomerId: 1,
                AssetId: 100,
                DateReceived: new Date().toISOString(),
                Notes: 'Test Job'
            };

            const res = await request(app).post('/api/jobs').send(payload);

            if (res.statusCode !== 201) {
                console.log(res.error);
            }
            expect(res.statusCode).toBe(201);
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should create a job with New Asset', async () => {
            // New Asset Flow on CONNECTION

            // 1. Insert Asset
            mockConnection.query.mockResolvedValueOnce([{ insertId: 200 }]); // Asset Create
            // 2. Fetch Asset (created)
            mockConnection.query.mockResolvedValueOnce([[{ AssetId: 200, InternalTag: 'NEW-TAG' }]]);

            // 3. Generate Job Number
            mockConnection.query.mockResolvedValueOnce([ [], [] ]);

            // 4. Insert ServiceRequest
            mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]);

            // 5. Fetch ServiceRequest (created)
            mockConnection.query.mockResolvedValueOnce([
                [{ JobNumber: '20231010002', AssetId: 200 }],
                []
            ]);

            const payload = {
                CustomerId: 1,
                NewAsset: {
                    PumpBrand: 'BrandNew',
                    PumpModel: 'ModelNew'
                },
                DateReceived: new Date().toISOString(),
                Notes: 'New Asset Job'
            };

            const res = await request(app).post('/api/jobs').send(payload);

            expect(res.statusCode).toBe(201);
            expect(mockConnection.beginTransaction).toHaveBeenCalled();
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });

        it('should rollback if error occurs', async () => {
             // Simulate error on Asset Insert
             mockConnection.query.mockRejectedValueOnce(new Error('DB Error'));

             const payload = {
                CustomerId: 1,
                NewAsset: { PumpBrand: 'P', PumpModel: 'M' },
                DateReceived: new Date().toISOString()
            };

            const res = await request(app).post('/api/jobs').send(payload);

            expect(res.statusCode).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
    });
});
