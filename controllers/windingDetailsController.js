const windingModel = require('../models/windingDetailsModel');
const { logAudit } = require('../utils/auditLogger');
const { filterWindingDetails } = require('../utils/responseFilter');

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
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let rows = await windingModel.getAllWindingDetails();

        // Map over rows and filter each, passing the JobStatus we now fetch
        const filtered = rows.map(item => {
            return filterWindingDetails(item, role, hideSensitive, item.JobStatus);
        });

        res.json(filtered);
    } catch (err) {
        next(err);
    }
}

async function getByJobNumber(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let records = await windingModel.getWindingDetailsByJobNumber(req.params.jobNumber);

        const filtered = records.map(item => {
             return filterWindingDetails(item, role, hideSensitive, item.JobStatus);
        });

        res.json(filtered);
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