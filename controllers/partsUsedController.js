const partsUsedModel = require('../models/partsUsedModel');
const { filterPartsUsed, filterPartsUsedList } = require('../utils/responseFilter');

// List parts used (optionally filtered by job)
async function listPartsUsed(req, res, next) {
    try {
        const jobNumber = req.query.jobNumber || null;
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let parts = await partsUsedModel.getAllPartsUsed(jobNumber);

        parts = filterPartsUsedList(parts, role, hideSensitive);

        res.json(parts);
    } catch (err) {
        next(err);
    }
}

// Get part used by id
async function getPartUsed(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let partUsed = await partsUsedModel.getPartUsedById(req.params.partUsedId);
        if (!partUsed) return res.status(404).json({ error: 'Parts entry not found' });

        partUsed = filterPartsUsed(partUsed, role, hideSensitive);

        res.json(partUsed);
    } catch (err) {
        next(err);
    }
}

// Add new parts used record
async function createPartUsed(req, res, next) {
    try {
        const partUsed = await partsUsedModel.addPartUsed(req.body);
        res.status(201).json(partUsed);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listPartsUsed,
    getPartUsed,
    createPartUsed
};