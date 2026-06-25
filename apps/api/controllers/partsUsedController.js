const partsUsedModel = require('../models/partsUsedModel');
const { filterPartsUsed, filterPartsUsedList } = require('../utils/responseFilter');
const NotificationService = require('../utils/notificationService');
const InventoryModel = require('../models/inventoryModel');

// List parts used (optionally filtered by job)
async function listPartsUsed(req, res, next) {
    try {
        const jobNumber = req.query.jobNumber || null;
        const role = req.user ? req.user.Role : null;
        let parts = await partsUsedModel.getAllPartsUsed(jobNumber);

        parts = filterPartsUsedList(parts, role);

        res.json(parts);
    } catch (err) {
        next(err);
    }
}

// Get part used by id
async function getPartUsed(req, res, next) {
    try {
        const role = req.user ? req.user.Role : null;
        let partUsed = await partsUsedModel.getPartUsedById(req.params.partUsedId);
        if (!partUsed) return res.status(404).json({ error: 'Parts entry not found' });

        partUsed = filterPartsUsed(partUsed, role);

        res.json(partUsed);
    } catch (err) {
        next(err);
    }
}

// Add new parts used record
async function createPartUsed(req, res, next) {
    try {
        const partUsed = await partsUsedModel.addPartUsed(req.body);

        // Check for Low Stock
        if (req.body.PartId) {
            const part = await InventoryModel.getInventoryById(req.body.PartId);
            if (part && part.QuantityInStock <= part.LowStockThreshold) {
                await NotificationService.notifyAdminsAndOwners(
                    'LowStock',
                    `Low Stock Alert: ${part.PartName}`,
                    `Stock for ${part.PartName} is now ${part.QuantityInStock} (Threshold: ${part.LowStockThreshold})`,
                    String(part.PartId)
                );
            }
        }

        res.status(201).json(partUsed);
    } catch (err) {
        next(err);
    }
}

// Update part used quantity
async function updatePartUsed(req, res, next) {
    try {
        const { Qty } = req.body;
        if (Qty === undefined || Qty <= 0) {
            return res.status(400).json({ error: 'Valid Qty is required' });
        }

        const role = req.user ? req.user.Role : null;
        let partUsed = await partsUsedModel.updatePartUsedQuantity(req.params.partUsedId, Qty);

        partUsed = filterPartsUsed(partUsed, role);

        // We could theoretically check low stock here again if Qty increased, but omitted for brevity
        // and because add is where it most often crosses the threshold initially.

        res.json(partUsed);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listPartsUsed,
    getPartUsed,
    createPartUsed,
    updatePartUsed
};