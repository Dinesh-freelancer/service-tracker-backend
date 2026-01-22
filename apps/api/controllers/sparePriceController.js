const sparePriceModel = require('../models/sparePriceModel');

/**
 * Handles the upsert request for a spare part.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Next middleware.
 */
async function upsertSpare(req, res, next) {
    try {
        const spareData = req.body;

        // At this point, validation middleware has already run.
        // req.body fields are trimmed by express-validator if we used sanitizers,
        // but explicit trimming in validation chain is good.

        await sparePriceModel.upsertSpare(spareData);

        // Minimal response for performance
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        // Log locally if needed, but per requirements "minimal logging".
        // Pass to global error handler which might log it.
        // If high-volume, we might want to avoid console.log for every error if it's spammy,
        // but 500s are serious.
        next(err);
    }
}

module.exports = {
    upsertSpare
};
