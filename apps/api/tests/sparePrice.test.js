const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the dependencies
jest.mock('../db', () => ({
    query: jest.fn()
}));

const pool = require('../db');
const sparePriceRoutes = require('../routes/sparePriceRoutes');
const errorHandler = require('../middleware/errorHandler');

// Setup App
const app = express();
app.use(bodyParser.json());
app.use('/api/spares', sparePriceRoutes);
app.use(errorHandler);

// Env config
process.env.SPARES_SYNC_KEY = 'test-secret';

describe('POST /api/spares/upsert', () => {

    beforeEach(() => {
        pool.query.mockClear();
    });

    it('should fail if API Key is missing', async () => {
        const res = await request(app)
            .post('/api/spares/upsert')
            .send({});
        expect(res.statusCode).toBe(403);
    });

    it('should fail if validation fails (missing fields)', async () => {
        const res = await request(app)
            .post('/api/spares/upsert')
            .set('x-api-key', 'test-secret')
            .send({
                pumpCategory: 'Submersible'
                // Missing other fields
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    it('should succeed with valid payload and execute SQL', async () => {
        pool.query.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);

        const payload = {
            pumpCategory: "Submersible",
            pumpType: "XYZ",
            pumpSize: "10HP",
            spareName: "Impeller",
            basicMaterial: "A276 TYPE 410+NITRIDING",
            partNo: "SP1234",
            unitPrice: 1450.75,
            uom: "NOS",
            sapMaterial: "SAP9988"
        };

        const res = await request(app)
            .post('/api/spares/upsert')
            .set('x-api-key', 'test-secret')
            .send(payload);

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');

        // Check if DB was called with correct values
        expect(pool.query).toHaveBeenCalledTimes(1);
        const calledSql = pool.query.mock.calls[0][0];
        const calledValues = pool.query.mock.calls[0][1];

        expect(calledSql).toContain('INSERT INTO spare_price_search');
        expect(calledSql).toContain('ON DUPLICATE KEY UPDATE');
        expect(calledValues[0]).toBe('Submersible');
        expect(calledValues[7]).toBe(1450.75);
    });

    it('should trim strings correctly', async () => {
        pool.query.mockResolvedValue([{ insertId: 1 }]);

        const payload = {
            pumpCategory: "  Submersible  ",
            pumpType: "XYZ",
            pumpSize: "10HP",
            spareName: "Impeller",
            basicMaterial: "Mat",
            unitPrice: 100,
            uom: "NOS"
        };

        await request(app)
            .post('/api/spares/upsert')
            .set('x-api-key', 'test-secret')
            .send(payload);

        const calledValues = pool.query.mock.calls[0][1];
        expect(calledValues[0]).toBe('Submersible'); // Trimmed
    });
});
