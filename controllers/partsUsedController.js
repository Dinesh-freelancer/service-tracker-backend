const partsUsedModel = require('../models/partsUsedModel');

// List parts used (optionally filtered by job)
async function listPartsUsed(req, res, next) {
    try {
        const jobNumber = req.query.jobNumber || null;
        const parts = await partsUsedModel.getAllPartsUsed(jobNumber);
        res.json(parts);
    } catch (err) {
        next(err);
    }
}

// Get part used by id
async function getPartUsed(req, res, next) {
    try {
        const partUsed = await partsUsedModel.getPartUsedById(req.params.partUsedId);
        if (!partUsed) return res.status(404).json({ error: 'Parts entry not found' });
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