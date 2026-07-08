const focModel = require('../models/focModel');

async function getAllClaims(req, res, next) {
    try {
        const filters = {
            status: req.query.status,
            jobNumber: req.query.jobNumber
        };
        const claims = await focModel.getAllClaims(filters);
        res.json(claims);
    } catch (err) {
        next(err);
    }
}

async function getClaim(req, res, next) {
    try {
        const claim = await focModel.getClaimById(req.params.id);
        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        res.json(claim);
    } catch (err) {
        next(err);
    }
}

async function createClaim(req, res, next) {
    try {
        const claimData = { ...req.body };
        if (!claimData.SRNumber || !claimData.SRDate) {
            return res.status(400).json({ error: 'SRNumber and SRDate are mandatory fields' });
        }
        const insertId = await focModel.createClaim(claimData);
        res.status(201).json({ id: insertId, message: 'Claim created successfully' });
    } catch (err) {
        next(err);
    }
}

async function updateClaim(req, res, next) {
    try {
        const affectedRows = await focModel.updateClaim(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        res.json({ message: 'Claim updated successfully' });
    } catch (err) {
        next(err);
    }
}

async function deleteClaim(req, res, next) {
    try {
        const affectedRows = await focModel.deleteClaim(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        res.json({ message: 'Claim deleted successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllClaims,
    getClaim,
    createClaim,
    updateClaim,
    deleteClaim
};
