const inventoryAlertModel = require('../models/inventoryAlertModel');

async function lowStockAlerts(req, res, next) {
    try {
        const alerts = await inventoryAlertModel.getLowStockAlerts();
        res.json(alerts);
    } catch (err) {
        next(err);
    }
}

async function outOfStockAlerts(req, res, next) {
    try {
        const alerts = await inventoryAlertModel.getOutOfStockAlerts();
        res.json(alerts);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    lowStockAlerts,
    outOfStockAlerts
};