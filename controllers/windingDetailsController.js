const windingModel = require('../models/windingDetailsModel');
const { logAudit } = require('../utils/auditLogger');
const { STRING_HIDDEN } = require('../utils/constants');

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
        let rows = await windingModel.getAllWindingDetails();
        if (hideSensitive) {
            rows = rows.map(item => ({
                "id": item.id,
                "jobNumber": STRING_HIDDEN,
                "hp": STRING_HIDDEN,
                "kw": STRING_HIDDEN,
                "phase": STRING_HIDDEN,
                "connection_type": STRING_HIDDEN,
                "swg_run": STRING_HIDDEN,
                "swg_start": STRING_HIDDEN,
                "swg_3phase": STRING_HIDDEN,
                "wire_id_run": STRING_HIDDEN,
                "wire_od_run": STRING_HIDDEN,
                "wire_id_start": STRING_HIDDEN,
                "wire_od_start": STRING_HIDDEN,
                "wire_id_3phase": STRING_HIDDEN,
                "wire_od_3phase": STRING_HIDDEN,
                "turns_run": STRING_HIDDEN,
                "turns_start": STRING_HIDDEN,
                "turns_3phase": STRING_HIDDEN,
                "slot_turns_run": STRING_HIDDEN,
                "slot_turns_start": STRING_HIDDEN,
                "slot_turns_3phase": STRING_HIDDEN,
                "notes": STRING_HIDDEN,
                "created_at": STRING_HIDDEN,
                "updated_at": STRING_HIDDEN
            }));
        }
        res.json(rows);
    } catch (err) {
        next(err);
    }
}

async function getByJobNumber(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let records = await windingModel.getWindingDetailsByJobNumber(req.params.jobNumber);
        if (hideSensitive) {
            records = records.map(item => ({
                "id": item.id,
                "jobNumber": STRING_HIDDEN,
                "hp": STRING_HIDDEN,
                "kw": STRING_HIDDEN,
                "phase": STRING_HIDDEN,
                "connection_type": STRING_HIDDEN,
                "swg_run": STRING_HIDDEN,
                "swg_start": STRING_HIDDEN,
                "swg_3phase": STRING_HIDDEN,
                "wire_id_run": STRING_HIDDEN,
                "wire_od_run": STRING_HIDDEN,
                "wire_id_start": STRING_HIDDEN,
                "wire_od_start": STRING_HIDDEN,
                "wire_id_3phase": STRING_HIDDEN,
                "wire_od_3phase": STRING_HIDDEN,
                "turns_run": STRING_HIDDEN,
                "turns_start": STRING_HIDDEN,
                "turns_3phase": STRING_HIDDEN,
                "slot_turns_run": STRING_HIDDEN,
                "slot_turns_start": STRING_HIDDEN,
                "slot_turns_3phase": STRING_HIDDEN,
                "notes": STRING_HIDDEN,
                "created_at": STRING_HIDDEN,
                "updated_at": STRING_HIDDEN
            }));
        }
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