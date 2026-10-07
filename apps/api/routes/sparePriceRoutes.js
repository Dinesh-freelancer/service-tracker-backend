const express = require('express');
const router = express.Router();
const sparePriceController = require('../controllers/sparePriceController');
const { validateSpareUpsert } = require('../middleware/spareValidationMiddleware');
const { verifySparesApiKey } = require('../middleware/securityMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// API Key authenticated route for external service upserts
router.post(
    '/upsert',
    verifySparesApiKey,
    validateSpareUpsert,
    sparePriceController.upsertSpare
);

// Dashboard routes (JWT authenticated)
router.get('/search', authenticateToken, sparePriceController.searchSpares);
router.get('/pump-options', authenticateToken, sparePriceController.getPumpOptions);

// JSON File upload sync route (allows sync payload up to 50MB)
router.post(
    '/sync',
    authenticateToken,
    express.json({ limit: '50mb' }),
    sparePriceController.syncSpares
);

module.exports = router;
