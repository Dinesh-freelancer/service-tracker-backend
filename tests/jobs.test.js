const request = require('supertest');
const express = require('express');
const jobRoutes = require('../routes/jobs');
const { validateRequest, createServiceRequestValidators } = require('../middleware/validationMiddleware');

// Mock dependencies
jest.mock('../db', () => ({
    query: jest.fn(),
    execute: jest.fn(),
    getConnection: jest.fn()
}));
jest.mock('../middleware/authMiddleware', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { UserId: 1, Role: 'Admin' };
        next();
    },
    authorize: (...roles) => (req, res, next) => next()
}));
jest.mock('../middleware/sensitiveInfoToggle', () => (req, res, next) => next());

const pool = require('../db');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobRoutes);

describe('Jobs API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/jobs', () => {
        it('should return paginated list of jobs', async () => {
            // Mock DB response
            pool.query.mockResolvedValueOnce([
                [{ JobNumber: 'JOB123', PumpBrand: 'P1', MotorBrand: 'M1' }], // rows
                [] // fields
            ]);
            // Mock count query
            pool.query.mockResolvedValueOnce([
                [{ total: 1 }],
                []
            ]);

            const res = await request(app).get('/api/jobs');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body).toHaveProperty('pagination');
            expect(res.body.data[0].JobNumber).toBe('JOB123');
        });
    });

    describe('POST /api/jobs', () => {
        it('should create a job with Pump and Motor fields', async () => {
            // Mock the SELECT query for generating JobNumber
            pool.query.mockResolvedValueOnce([
                [], // No existing jobs today
                []
            ]);

            // Mock INSERT servicerequest
            pool.execute.mockResolvedValueOnce([{ insertId: 1 }]);

            // Mock INSERT audit (triggered by logAudit)
            pool.execute.mockResolvedValueOnce([{ insertId: 2 }]);

            // Mock getServiceRequest call after creation
            pool.query.mockResolvedValueOnce([
                [{ JobNumber: '20231010001', PumpBrand: 'BrandX', PumpModel: 'ModelX', MotorBrand: 'BrandY', MotorModel: 'ModelY' }],
                []
            ]);

            const payload = {
                CustomerId: 1,
                PumpBrand: 'BrandX',
                PumpModel: 'ModelX',
                MotorBrand: 'BrandY',
                MotorModel: 'ModelY',
                DateReceived: new Date().toISOString()
            };

            const res = await request(app).post('/api/jobs').send(payload);

            if (res.statusCode !== 201) {
                console.log(res.error);
            }
            expect(res.statusCode).toBe(201);
            expect(pool.execute).toHaveBeenCalledWith(
                expect.stringMatching(/INSERT INTO ServiceRequest/i),
                expect.arrayContaining(['BrandX', 'ModelX', 'BrandY', 'ModelY'])
            );
        });

        it('should fail if CustomerId is missing', async () => {
            const payload = {
                PumpBrand: 'BrandX'
            };
            const res = await request(app).post('/api/jobs').send(payload);
            expect(res.statusCode).toBe(400);
        });
    });
});
