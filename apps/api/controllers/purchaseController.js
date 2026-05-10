const purchaseModel = require('../models/purchaseModel');
const { logAudit } = require('../utils/auditLogger');
const { STRING_HIDDEN } = require('../utils/constants');

// Get all purchases
async function getAllPurchases(req, res, next) {
    try {
        let filters = req.query || {};
        let purchases = await purchaseModel.getAllPurchases(filters);
        // Note: With RBAC, Admin/Owner can see purchases.
        // Workers should not access this route at all (protected in routes).
        // If we want to hide sensitive info from Admins (like supplier details?), we would do it here.
        // But typically Admin needs to see purchases. So we return as is.
        res.json(purchases);
    } catch (err) {
        next(err);
    }
}

// Get purchase by ID
async function getPurchaseById(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let purchase = await purchaseModel.getPurchaseById(req.params.id);
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