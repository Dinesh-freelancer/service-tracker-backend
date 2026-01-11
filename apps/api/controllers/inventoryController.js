const inventoryModel = require('../models/inventoryModel');
const { filterInventory, filterInventoryList } = require('../utils/responseFilter');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');
const { buildSearchFilters } = require('../utils/queryHelper');

/**
 * Lists all inventory items with pagination and searching.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listInventory(req, res, next) {
    try {
        const role = req.user ? req.user.Role : null;
        const { page, limit, offset } = getPagination(req);

        const searchableFields = ['PartName'];
        const filters = buildSearchFilters(req.query, searchableFields);

        const { rows, totalCount } = await inventoryModel.getAllInventory(filters, limit, offset);

        const filteredInventory = filterInventoryList(rows, role);
        const response = getPaginationData(filteredInventory, page, limit, totalCount);

        res.json(response);
    } catch (err) {
        next(err);
    }
}

// Get inventory item by ID
async function getInventoryItem(req, res, next) {
    try {
        const role = req.user ? req.user.Role : null;
        let item = await inventoryModel.getInventoryById(req.params.partId);

        if (!item) return res.status(404).json({ error: 'Inventory item not found' });

        item = filterInventory(item, role);

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