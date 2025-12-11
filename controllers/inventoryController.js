const inventoryModel = require('../models/inventoryModel');
const { STRING_HIDDEN } = require('../utils/constants');
// List inventory items
async function listInventory(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let inventory = await inventoryModel.getAllInventory();
        if (hideSensitive) {
            inventory = inventory.map(item => ({
                "PartId": item.PartId,
                "PartName": STRING_HIDDEN,
                "Unit": STRING_HIDDEN,
                "DefaultCostPrice": STRING_HIDDEN,
                "DefaultSellingPrice": STRING_HIDDEN,
                "Supplier": STRING_HIDDEN,
                "QuantityInStock": STRING_HIDDEN,
                "LowStockThreshold": STRING_HIDDEN,
                "Notes": STRING_HIDDEN
            }))
        }
        res.json(inventory);
    } catch (err) {
        next(err);
    }
}

// Get inventory item by ID
async function getInventoryItem(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let item = await inventoryModel.getInventoryById(req.params.partId);
        if(hideSensitive){
            item = {
                "PartId": item.PartId,
                "PartName": STRING_HIDDEN,
                "Unit": STRING_HIDDEN,
                "DefaultCostPrice": STRING_HIDDEN,
                "DefaultSellingPrice": STRING_HIDDEN,
                "Supplier": STRING_HIDDEN,
                "QuantityInStock": STRING_HIDDEN,
                "LowStockThreshold": STRING_HIDDEN,
                "Notes": STRING_HIDDEN
            };
        }
        if (!item) return res.status(404).json({ error: 'Inventory item not found' });
        res.json(item);
    } catch (err) {
        next(err);
    }
}

// Add inventory item
async function createInventoryItem(req, res, next) {
    try {
        const item = await inventoryModel.addInventory(req.body);
        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listInventory,
    getInventoryItem,
    createInventoryItem
};