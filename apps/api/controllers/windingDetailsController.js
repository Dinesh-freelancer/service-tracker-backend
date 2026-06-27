const windingDetailsModel = require('../models/windingDetailsModel');
const assetModel = require('../models/assetModel');

async function getWindingDetails(req, res, next) {
    try {
        const { assetId } = req.params;
        const details = await windingDetailsModel.getWindingDetailsByAssetId(assetId);

        let finalDetails = details || {};

        // Parse JSON fields if they come back as strings (MySQL JSON type usually returns parsed objects in mysql2, but just to be safe)
        if (details) {
            ['slot_turns_run', 'slot_turns_start', 'slot_turns_3phase'].forEach(field => {
                if (typeof details[field] === 'string') {
                    try { details[field] = JSON.parse(details[field]); } catch(e) {}
                }
            });
        } else {
            // If details don't exist, we can try to fetch HP/KW defaults from Asset
            const asset = await assetModel.getAssetById(assetId);
            if (asset && asset.PowerRating) {
                if (asset.PowerUnit === 'HP') {
                    finalDetails.hp = asset.PowerRating;
                    finalDetails.kw = null;
                } else if (asset.PowerUnit === 'KW') {
                    finalDetails.kw = asset.PowerRating;
                    finalDetails.hp = null;
                }
            }
        }

        // Even if details exist, if they have null HP/KW, we could theoretically fallback to asset.
        // However, if the user explicitly saved them as null, we should respect the null.
        // The requirement: "By default, the HP or KW is saved from Asset details... If a user explicitly clears the HP or KW field... it should automatically fall back and fetch/save the value from the linked Asset."
        // Wait, the user specifically requested: "If a user explicitly clears the HP or KW field in the winding details form and submits it... Fetch from linked asset"
        if (finalDetails.hp === null && finalDetails.kw === null) {
            const asset = await assetModel.getAssetById(assetId);
            if (asset && asset.PowerRating) {
                if (asset.PowerUnit === 'HP') {
                    finalDetails.hp = asset.PowerRating;
                } else if (asset.PowerUnit === 'KW') {
                    finalDetails.kw = asset.PowerRating;
                }
            }
        }

        res.json(finalDetails);
    } catch (err) {
        next(err);
    }
}

async function saveWindingDetails(req, res, next) {
    try {
        const { assetId } = req.params;
        const data = req.body;

        // Verify asset exists
        const asset = await assetModel.getAssetById(assetId);
        if (!asset) {
            return res.status(404).json({ error: 'Asset not found' });
        }

        const result = await windingDetailsModel.upsertWindingDetails({
            assetId: assetId,
            ...data
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getWindingDetails,
    saveWindingDetails
};
