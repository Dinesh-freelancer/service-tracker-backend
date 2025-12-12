const inventoryModel = require('../models/inventoryModel');
const { filterInventory, filterInventoryList } = require('../utils/responseFilter');

// List inventory items
async function listInventory(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let inventory = await inventoryModel.getAllInventory();

        inventory = filterInventoryList(inventory, role, hideSensitive);

        res.json(inventory);
    } catch (err) {
        next(err);
    }
}

// Get inventory item by ID
async function getInventoryItem(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let item = await inventoryModel.getInventoryById(req.params.partId);

        if (!item) return res.status(404).json({ error: 'Inventory item not found' });

        item = filterInventory(item, role, hideSensitive);

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