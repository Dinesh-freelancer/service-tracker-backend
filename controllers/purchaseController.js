const purchaseModel = require('../models/purchaseModel');
const { logAudit } = require('../utils/auditLogger');

// Get all purchases
async function getAllPurchases(req, res, next) {
    try {
        const purchases = await purchaseModel.getAllPurchases();
        res.json(purchases);
    } catch (err) {
        next(err);
    }
}

// Get purchase by ID
async function getPurchaseById(req, res, next) {
    try {
        const purchase = await purchaseModel.getPurchaseById(req.params.id);
        if (!purchase) {
            return res.status(404).json({ error: 'Purchase not found' });
        }
        res.json(purchase);
    } catch (err) {
        next(err);
    }
}

// Create new purchase
async function createPurchase(req, res, next) {
    try {
        const purchaseData = req.body.purchase;
        const items = req.body.items;

        if (!purchaseData || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Purchase data and items are required' });
        }

        purchaseData.PurchasedBy = req.user.UserId; // From auth middleware

        const newPurchase = await purchaseModel.createPurchase(purchaseData, items);

        await logAudit({
            ActionType: 'Purchase Created',
            ChangedBy: req.user.UserId,
            Details: `Purchase ID ${newPurchase.PurchaseId} created with ${items.length} items`
        });

        res.status(201).json(newPurchase);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase
};