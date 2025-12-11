const partsUsedModel = require('../models/partsUsedModel');
const { STRING_HIDDEN } = require('../utils/constants');

// List parts used (optionally filtered by job)
async function listPartsUsed(req, res, next) {
    try {
        const jobNumber = req.query.jobNumber || null;
        const hideSensitive = req.hideSensitive;
        let parts = await partsUsedModel.getAllPartsUsed(jobNumber);
        if (hideSensitive) {
            parts = parts.map(item => ({
                "PartUsedId": item.PartUsedId,
                "JobNumber": STRING_HIDDEN,
                "PartName": STRING_HIDDEN,
                "Unit": STRING_HIDDEN,
                "Qty": STRING_HIDDEN,
                "CostPrice": STRING_HIDDEN,
                "BilledPrice": STRING_HIDDEN,
                "Supplier": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN
            }))
        }
        res.json(parts);
    } catch (err) {
        next(err);
    }
}

// Get part used by id
async function getPartUsed(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let partUsed = await partsUsedModel.getPartUsedById(req.params.partUsedId);
        if (!partUsed) return res.status(404).json({ error: 'Parts entry not found' });
        if (hideSensitive) {
            partUsed = {
                "PartUsedId": partUsed.PartUsedId,
                "JobNumber": STRING_HIDDEN,
                "PartName": STRING_HIDDEN,
                "Unit": STRING_HIDDEN,
                "Qty": STRING_HIDDEN,
                "CostPrice": STRING_HIDDEN,
                "BilledPrice": STRING_HIDDEN,
                "Supplier": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN
            }
        }
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