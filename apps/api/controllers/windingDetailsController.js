const windingDetailsModel = require('../models/windingDetailsModel');
const serviceRequestModel = require('../models/serviceRequestModel'); // To verify job exists

async function getWindingDetails(req, res, next) {
    try {
        const { jobNumber } = req.params;
        const details = await windingDetailsModel.getWindingDetailsByJobNumber(jobNumber);
        // If no details found, return empty object or null, not 404, so frontend can show empty form
        res.json(details || {});
    } catch (err) {
        next(err);
    }
}

async function saveWindingDetails(req, res, next) {
    try {
        const { jobNumber } = req.params;
        const data = req.body;

        // Verify job exists
        const job = await serviceRequestModel.getServiceRequestByJobNumber(jobNumber);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }

        const result = await windingDetailsModel.upsertWindingDetails({
            JobNumber: jobNumber,
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
