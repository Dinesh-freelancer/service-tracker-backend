const windingModel = require('../models/windingDetailsModel');
const { logAudit } = require('../utils/auditLogger');

async function createWindingDetail(req, res, next) {
    try {
        const result = await windingModel.addWindingDetail(req.body);
        await logAudit({
            ActionType: 'WindingDetails Created',
            ChangedBy: req.user.UserId,
            Details: `Winding details for Job ${result.jobNumber} added`
        });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function getAllWindingDetails(req, res, next) {
    try {
        const rows = await windingModel.getAllWindingDetails();
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

async function getByJobNumber(req, res, next) {
    try {
        const records = await windingModel.getWindingDetailsByJobNumber(req.params.jobNumber);
        res.json(records);
    } catch (err) {
        next(err);
    }
}

async function updateWindingDetail(req, res, next) {
    try {
        const updated = await windingModel.updateWindingDetail(req.params.id, req.body);
        await logAudit({
            ActionType: 'WindingDetails Updated',
            ChangedBy: req.user.UserId,
            Details: `Winding details ID ${req.params.id} updated`
        });
        res.json(updated);
    } catch (err) {
        next(err);
    }
}

async function deleteWindingDetail(req, res, next) {
    try {
        await windingModel.deleteWindingDetail(req.params.id);
        await logAudit({
            ActionType: 'WindingDetails Deleted',
            ChangedBy: req.user.UserId,
            Details: `Winding details ID ${req.params.id} deleted`
        });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createWindingDetail,
    getAllWindingDetails,
    getByJobNumber,
    updateWindingDetail,
    deleteWindingDetail
};