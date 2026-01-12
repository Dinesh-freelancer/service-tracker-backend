const assetModel = require('../models/assetModel');
const { AUTH_ROLE_CUSTOMER } = require('../utils/constants');
const { validationResult } = require('express-validator');

// List assets (filtered by CustomerId if user is Customer)
async function listAssets(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let customerId = req.query.customerId;
        const role = req.user.Role;

        // Security: Customers can only see their own assets
        if (role === AUTH_ROLE_CUSTOMER) {
            customerId = req.user.CustomerId;
        }

        if (!customerId && role !== AUTH_ROLE_CUSTOMER) {
             // If no customer ID provided and admin/worker, maybe return empty or handle search
             // For now, let's require customerId for listing, or use search endpoint
             return res.status(400).json({ error: 'CustomerId is required' });
        }

        const assets = await assetModel.getAssetsByCustomerId(customerId);
        res.json(assets);
    } catch (err) {
        next(err);
    }
}

// Get single asset
async function getAsset(req, res, next) {
    try {
        const asset = await assetModel.getAssetById(req.params.id);
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        // Security check
        if (req.user.Role === AUTH_ROLE_CUSTOMER && asset.CustomerId !== req.user.CustomerId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(asset);
    } catch (err) {
        next(err);
    }
}

// Create Asset
async function createAsset(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const assetData = req.body;

        // Security: Ensure CustomerId matches logged in user if they are a customer
        if (req.user.Role === AUTH_ROLE_CUSTOMER) {
            assetData.CustomerId = req.user.CustomerId;
        }

        const newAsset = await assetModel.createAsset(assetData);
        res.status(201).json(newAsset);
    } catch (err) {
        next(err);
    }
}

// Update Asset
async function updateAsset(req, res, next) {
    try {
        const assetId = req.params.id;
        const existing = await assetModel.getAssetById(assetId);

        if (!existing) return res.status(404).json({ error: 'Asset not found' });

        if (req.user.Role === AUTH_ROLE_CUSTOMER && existing.CustomerId !== req.user.CustomerId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await assetModel.updateAsset(assetId, req.body);
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listAssets,
    getAsset,
    createAsset,
    updateAsset
};
