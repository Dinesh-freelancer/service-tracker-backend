const express = require('express');
const router = express.Router();
const sparePriceController = require('../controllers/sparePriceController');
const { validateSpareUpsert } = require('../middleware/spareValidationMiddleware');
const { verifySparesApiKey } = require('../middleware/securityMiddleware');

/**
 * @swagger
 * /api/spares/upsert:
 *   post:
 *     summary: Upsert a spare part price record
 *     tags: [Spares]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pumpCategory
 *               - pumpType
 *               - pumpSize
 *               - spareName
 *               - basicMaterial
 *               - unitPrice
 *               - uom
 *             properties:
 *               pumpCategory:
 *                 type: string
 *               pumpType:
 *                 type: string
 *               pumpSize:
 *                 type: string
 *               spareName:
 *                 type: string
 *               basicMaterial:
 *                 type: string
 *               partNo:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               uom:
 *                 type: string
 *               sapMaterial:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Validation Error
 *       403:
 *         description: Invalid API Key
 */
router.post(
    '/upsert',
    verifySparesApiKey,
    validateSpareUpsert,
    sparePriceController.upsertSpare
);

module.exports = router;
