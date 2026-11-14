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

        const searchableFields = ['PartName', 'Make', 'Size'];
        const filters = buildSearchFilters(req.query, searchableFields);
        if (req.query.tagIds) filters.tagIds = req.query.tagIds;
        if (req.query.tags) filters.tags = req.query.tags;

        const { rows, totalCount } = await inventoryModel.getAllInventory(filters, limit, offset);

        const filteredInventory = filterInventoryList(rows, role);
        const response = getPaginationData(filteredInventory, page, limit, totalCount);

        res.json(response);
    } catch (err) {
        next(err);
    }
}

// Autocomplete search for tags
async function searchTags(req, res, next) {
    try {
        const q = req.query.q || '';
        const limit = req.query.limit || 20;
        const tags = await inventoryModel.searchTags(q, limit);
        res.json(tags);
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
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'An inventory item with this PartName, Make, and Size already exists' });
        }
        next(err);
    }
}

// Update inventory item
async function updateInventoryItem(req, res, next) {
    try {
        const item = await inventoryModel.updateInventory(req.params.partId, req.body);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'An inventory item with this PartName, Make, and Size already exists' });
        }
        next(err);
    }
}

// Delete inventory item
async function deleteInventoryItem(req, res, next) {
    try {
        await inventoryModel.deleteInventory(req.params.partId);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

// Get stock locations & pack sizes for a part (Loose with stock ordered first for autofill)
async function getPartStock(req, res, next) {
    try {
        const stock = await inventoryModel.getStockByPartId(req.params.partId);
        res.json(stock);
    } catch (err) {
        next(err);
    }
}

// Add or adjust stock at a specific Location + PackType + UnitsPerPack
async function upsertPartStock(req, res, next) {
    try {
        const partId = parseInt(req.params.partId, 10);
        const { LocationId, PackType, UnitsPerPack, QuantityDelta, SetQuantity } = req.body;
        if (!LocationId) {
            return res.status(400).json({ error: 'LocationId is required' });
        }
        const stock = await inventoryModel.upsertStock(null, {
            PartId: partId,
            LocationId,
            PackType: PackType || 'Loose',
            UnitsPerPack: UnitsPerPack || 1,
            QuantityDelta: QuantityDelta !== undefined ? QuantityDelta : 0,
            SetQuantity: SetQuantity !== undefined ? SetQuantity : null
        });
        res.json(stock);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listInventory,
    searchTags,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getPartStock,
    upsertPartStock
};