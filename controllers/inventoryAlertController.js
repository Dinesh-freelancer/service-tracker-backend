const inventoryAlertModel = require('../models/inventoryAlertModel');
const { STRING_HIDDEN } = require('../utils/constants');

async function lowStockAlerts(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let alerts = await inventoryAlertModel.getLowStockAlerts();
        if (hideSensitive) {
            alerts = alerts.map(item => ({
                "PartId": item.PartId,
                "PartName": STRING_HIDDEN,
                "QuantityInStock": STRING_HIDDEN,
                "LowStockThreshold": STRING_HIDDEN,
                "Supplier": STRING_HIDDEN,
                "Notes": STRING_HIDDEN
            }))
        }
        res.json(alerts);
    } catch (err) {
        next(err);
    }
}

async function outOfStockAlerts(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let alerts = await inventoryAlertModel.getOutOfStockAlerts();
         if (hideSensitive) {
            alerts = alerts.map(item => ({
                "PartId": item.PartId,
                "PartName": STRING_HIDDEN,
                "QuantityInStock": STRING_HIDDEN,
                "Supplier": STRING_HIDDEN,
                "Notes": STRING_HIDDEN
            }))
        }
        res.json(alerts);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    lowStockAlerts,
    outOfStockAlerts
};