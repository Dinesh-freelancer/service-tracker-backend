const locationModel = require('../models/locationModel');

async function listLocations(req, res, next) {
    try {
        const locations = await locationModel.getAllLocations(req.query);
        res.json(locations);
    } catch (err) {
        next(err);
    }
}

async function getLocation(req, res, next) {
    try {
        const location = await locationModel.getLocationById(req.params.locationId);
        if (!location) return res.status(404).json({ error: 'Location not found' });
        res.json(location);
    } catch (err) {
        next(err);
    }
}

async function createLocation(req, res, next) {
    try {
        const location = await locationModel.createLocation(req.body);
        res.status(201).json(location);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A location with this name already exists under the same parent' });
        }
        next(err);
    }
}

async function updateLocation(req, res, next) {
    try {
        const location = await locationModel.updateLocation(req.params.locationId, req.body);
        if (!location) return res.status(404).json({ error: 'Location not found' });
        res.json(location);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A location with this name already exists under the same parent' });
        }
        next(err);
    }
}

async function deleteLocation(req, res, next) {
    try {
        const deleted = await locationModel.deleteLocation(req.params.locationId);
        if (!deleted) return res.status(404).json({ error: 'Location not found' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listLocations,
    getLocation,
    createLocation,
    updateLocation,
    deleteLocation
};
