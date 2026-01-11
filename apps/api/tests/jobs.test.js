const request = require('supertest');
const express = require('express');
const jobRoutes = require('../routes/jobs');
const { STRING_HIDDEN } = require('../utils/constants');

// Mock Connection Object
const mockConnection = {
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    rollback: jest.fn(),
    release: jest.fn(),
    query: jest.fn()
};

let mockUser = { UserId: 1, Role: 'Admin' };

// Mock dependencies
jest.mock('../db', () => ({
    query: jest.fn(),
    execute: jest.fn(),
    getConnection: jest.fn(() => Promise.resolve(mockConnection))
}));
jest.mock('../middleware/authMiddleware', () => ({
    authenticateToken: (req, res, next) => {
        req.user = mockUser;
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
        mockUser = { UserId: 1, Role: 'Admin' }; // Reset Role
        // Reset pool query default
        pool.query.mockResolvedValue([ [], [] ]);
        // Reset connection query default
        mockConnection.query.mockResolvedValue([ [], [] ]);
    });

    describe('GET /api/jobs', () => {
        it('should return paginated list of jobs', async () => {
            // Mock DB response (pool.query used for list)
            pool.query.mockResolvedValueOnce([
                [{ JobNumber: 'JOB123', InternalTag: 'TAG1', Brand: 'B1' }], // rows
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

    describe('GET /api/jobs/:jobNumber', () => {
        it('should return job details with history, parts, and documents', async () => {
            // 1. serviceRequestModel.getServiceRequestByJobNumber
            pool.query.mockResolvedValueOnce([
                [{ JobNumber: 'JOB123', CustomerId: 1, Brand: 'P1' }],
                []
            ]);

            // 2. Promise.all parallel queries:
            // history
            pool.query.mockResolvedValueOnce([ [{ HistoryId: 1, StatusTo: 'Intake' }], [] ]);
            // parts
            pool.query.mockResolvedValueOnce([ [{ PartName: 'Bearing' }], [] ]);
            // documents
            pool.query.mockResolvedValueOnce([ [{ DocumentType: 'Photo' }], [] ]);

            const res = await request(app).get('/api/jobs/JOB123');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('JobNumber', 'JOB123');
            expect(res.body).toHaveProperty('History');
            expect(res.body.History).toHaveLength(1);
            expect(res.body).toHaveProperty('Parts');
            expect(res.body.Parts).toHaveLength(1);
            expect(res.body).toHaveProperty('Documents');
            expect(res.body.Documents).toHaveLength(1);
        });

        it('should hide Customer Name for Workers', async () => {
            mockUser.Role = 'Worker';

            // 1. Job Data
            pool.query.mockResolvedValueOnce([
                [{ JobNumber: 'JOB123', CustomerId: 1, CustomerName: 'Secret Customer', PrimaryContact: '12345' }],
                []
            ]);
            // 2. Parallel queries (History, Parts, Docs)
            pool.query.mockResolvedValueOnce([ [], [] ]);
            pool.query.mockResolvedValueOnce([ [], [] ]);
            pool.query.mockResolvedValueOnce([ [], [] ]);

            const res = await request(app).get('/api/jobs/JOB123');

            expect(res.statusCode).toBe(200);
            expect(res.body.CustomerName).toBe(STRING_HIDDEN);
            expect(res.body.PrimaryContact).toBe(STRING_HIDDEN);
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
                    Brand: 'BrandNew',
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
                NewAsset: { Brand: 'P', PumpModel: 'M' },
                DateReceived: new Date().toISOString()
            };

            const res = await request(app).post('/api/jobs').send(payload);

            expect(res.statusCode).toBe(500);
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
        });
    });
});
