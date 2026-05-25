const salesItemModel = require('../models/salesItemModel');

// List sales items
async function listSalesItems(req, res, next) {
    try {
        const items = await salesItemModel.getAllSalesItems();
        res.json(items);
    } catch (err) {
        next(err);
    }
}

// Get sales item by ID
async function getSalesItem(req, res, next) {
    try {
        const item = await salesItemModel.getSalesItemById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Sales item not found' });
        res.json(item);
    } catch (err) {
        next(err);
    }
}

// Add a new sales item
async function createSalesItem(req, res, next) {
    try {
        const insertId = await salesItemModel.addSalesItem(req.body);
        const newItem = await salesItemModel.getSalesItemById(insertId);
        res.status(201).json(newItem);
    } catch (err) {
        next(err);
    }
}

// Update sales item
async function updateSalesItem(req, res, next) {
    try {
        await salesItemModel.updateSalesItem(req.params.id, req.body);
        const updatedItem = await salesItemModel.getSalesItemById(req.params.id);
        if (!updatedItem) return res.status(404).json({ error: 'Sales item not found' });
        res.json(updatedItem);
    } catch (err) {
        next(err);
    }
}

// Delete sales item
async function deleteSalesItem(req, res, next) {
    try {
        await salesItemModel.deleteSalesItem(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listSalesItems,
    getSalesItem,
    createSalesItem,
    updateSalesItem,
    deleteSalesItem
};
