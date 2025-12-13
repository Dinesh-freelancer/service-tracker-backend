const inventoryModel = require('../models/inventoryModel');
const { filterInventory, filterInventoryList } = require('../utils/responseFilter');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');

/**
 * Lists all inventory items with pagination, filtering sensitive fields.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listInventory(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        const { page, limit, offset } = getPagination(req);

        const { rows, totalCount } = await inventoryModel.getAllInventory(limit, offset);

        const filteredInventory = filterInventoryList(rows, role, hideSensitive);
        const response = getPaginationData(filteredInventory, page, limit, totalCount);

        res.json(response);
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