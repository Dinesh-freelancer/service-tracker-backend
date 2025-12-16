const purchaseModel = require('../models/purchaseModel');
const { logAudit } = require('../utils/auditLogger');
const { STRING_HIDDEN } = require('../utils/constants');

// Get all purchases
async function getAllPurchases(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let purchases = await purchaseModel.getAllPurchases();
        if (hideSensitive) {
            purchases = purchases.map(item => ({
                "PurchaseId": item.PurchaseId,
                "PurchaseDate": STRING_HIDDEN,
                "SupplierId": STRING_HIDDEN,
                "PurchasedBy": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN,
                "SupplierName": STRING_HIDDEN,
                "PurchasedByName": STRING_HIDDEN
            }));
        }
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
        if(hideSensitive){
            purchase = {
                "PurchaseId": purchase.PurchaseId,
                "PurchaseDate": STRING_HIDDEN,
                "SupplierId": STRING_HIDDEN,
                "PurchasedBy": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN,
                "SupplierName": STRING_HIDDEN,
                "PurchasedByName": STRING_HIDDEN
            };
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