const windingDetailsModel = require('../models/windingDetailsModel');
const assetModel = require('../models/assetModel');

async function getWindingDetails(req, res, next) {
    try {
        const { assetId } = req.params;
        const details = await windingDetailsModel.getWindingDetailsByAssetId(assetId);

        // Parse JSON fields if they come back as strings (MySQL JSON type usually returns parsed objects in mysql2, but just to be safe)
        if (details) {
            ['slot_turns_run', 'slot_turns_start', 'slot_turns_3phase'].forEach(field => {
                if (typeof details[field] === 'string') {
                    try { details[field] = JSON.parse(details[field]); } catch(e) {}
                }
            });
        }

        res.json(details || {});
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
