const sparePriceModel = require('../models/sparePriceModel');

/**
 * Handles upsert request for a single spare part.
 */
async function upsertSpare(req, res, next) {
    try {
        const spareData = req.body;
        await sparePriceModel.upsertSpare(spareData);
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        next(err);
    }
}

/**
 * Handles bulk sync request from JSON array payload.
 */
async function syncSpares(req, res, next) {
    try {
        let items = req.body;

        // If wrapped in object
        if (!Array.isArray(items) && items && Array.isArray(items.spares)) {
            items = items.spares;
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Payload must be a non-empty array of spare objects.' });
        }

        const result = await sparePriceModel.bulkSyncSpares(items);
        res.status(200).json({
            status: 'success',
            message: `Successfully synced ${result.totalProcessed} spares.`,
            ...result
        });
    } catch (err) {
        next(err);
    }
}

/**
 * Handles search and pagination for spares.
 */
async function searchSpares(req, res, next) {
    try {
        const filters = {
            mode: req.query.mode || 'spare',
            query: req.query.query || '',
            pumpCategory: req.query.pumpCategory || '',
            pumpType: req.query.pumpType || '',
            pumpSize: req.query.pumpSize || '',
            spareName: req.query.spareName || '',
            partNo: req.query.partNo || '',
            sapMaterial: req.query.sapMaterial || '',
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 20
        };

        const result = await sparePriceModel.searchSpares(filters);
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

/**
 * Returns distinct filter options for pumps.
 */
async function getPumpOptions(req, res, next) {
    try {
        const filters = {
            pumpCategory: req.query.pumpCategory || '',
            pumpType: req.query.pumpType || ''
        };
        const options = await sparePriceModel.getPumpOptions(filters);
        res.status(200).json(options);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    upsertSpare,
    syncSpares,
    searchSpares,
    getPumpOptions
};
