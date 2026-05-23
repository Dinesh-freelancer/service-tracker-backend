const settingsModel = require('../models/settingsModel');

async function getSettings(req, res, next) {
    try {
        const settings = await settingsModel.getAllSettings();
        res.json(settings);
    } catch (err) {
        next(err);
    }
}

async function updateSettings(req, res, next) {
    try {
        const settingsToUpdate = req.body;
        if (!settingsToUpdate || typeof settingsToUpdate !== 'object') {
            return res.status(400).json({ error: 'Invalid settings payload' });
        }
        await settingsModel.bulkUpdateSettings(settingsToUpdate);
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getSettings,
    updateSettings
};
