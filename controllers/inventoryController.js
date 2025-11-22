const inventoryModel = require('../models/inventoryModel');

// List inventory items
async function listInventory(req, res, next) {
    try {
        const inventory = await inventoryModel.getAllInventory();
        res.json(inventory);
    } catch (err) {
        next(err);
    }
}

// Get inventory item by ID
async function getInventoryItem(req, res, next) {
    try {
        const item = await inventoryModel.getInventoryById(req.params.partId);
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