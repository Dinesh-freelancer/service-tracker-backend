const annexureModel = require('../models/annexureModel');

async function getAllAnnexures(req, res, next) {
    try {
        const annexures = await annexureModel.getAllAnnexures();
        res.json(annexures);
    } catch (err) {
        next(err);
    }
}

async function getAnnexure(req, res, next) {
    try {
        const annexure = await annexureModel.getAnnexureById(req.params.id);
        if (!annexure) {
            return res.status(404).json({ error: 'Annexure not found' });
        }
        res.json(annexure);
    } catch (err) {
        next(err);
    }
}

async function createAnnexure(req, res, next) {
    try {
        const annexureData = { ...req.body };
        if (!annexureData.AnnexNumber) {
            return res.status(400).json({ error: 'AnnexNumber is mandatory' });
        }
        await annexureModel.createAnnexure(annexureData);
        res.status(201).json({ AnnexNumber: annexureData.AnnexNumber, message: 'Annexure created successfully' });
    } catch (err) {
        next(err);
    }
}

async function updateAnnexure(req, res, next) {
    try {
        const affectedRows = await annexureModel.updateAnnexure(req.params.id, req.body);
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Annexure not found' });
        }
        res.json({ message: 'Annexure updated successfully' });
    } catch (err) {
        next(err);
    }
}

async function deleteAnnexure(req, res, next) {
    try {
        const affectedRows = await annexureModel.deleteAnnexure(req.params.id);
        if (affectedRows === 0) {
            return res.status(404).json({ error: 'Annexure not found' });
        }
        res.json({ message: 'Annexure deleted successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllAnnexures,
    getAnnexure,
    createAnnexure,
    updateAnnexure,
    deleteAnnexure
};
