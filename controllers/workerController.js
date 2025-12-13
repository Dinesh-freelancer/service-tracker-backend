const workerModel = require('../models/workerModel');
const { STRING_HIDDEN } = require('../utils/constants');

/**
 * Lists all workers.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listWorkers(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let workers = await workerModel.getAllWorkers();
        if (hideSensitive) {
            workers = workers.map(item => ({
                "WorkerId": item.WorkerId,
                "WorkerName": STRING_HIDDEN,
                "MobileNumber": STRING_HIDDEN,
                "AlternateNumber": STRING_HIDDEN,
                "WhatsappNumber": STRING_HIDDEN,
                "Address": STRING_HIDDEN,
                "DateOfJoining": STRING_HIDDEN,
                "Skills": STRING_HIDDEN,
                "IsActive": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            }));
        }
        res.json(workers);
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieves a worker by ID.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function getWorker(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let worker = await workerModel.getWorkerById(req.params.workerId);
        if (!worker) return res.status(404).json({ error: 'Worker not found' });
        if(hideSensitive){
            worker = {
                "WorkerId": worker.WorkerId,
                "WorkerName": STRING_HIDDEN,
                "MobileNumber": STRING_HIDDEN,
                "AlternateNumber": STRING_HIDDEN,
                "WhatsappNumber": STRING_HIDDEN,
                "Address": STRING_HIDDEN,
                "DateOfJoining": STRING_HIDDEN,
                "Skills": STRING_HIDDEN,
                "IsActive": STRING_HIDDEN,
                "Notes": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            }
        }
        res.json(worker);
    } catch (err) {
        next(err);
    }
}

/**
 * Creates a new worker.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function createWorker(req, res, next) {
    try {
        const worker = await workerModel.addWorker(req.body);
        res.status(201).json(worker);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listWorkers,
    getWorker,
    createWorker
};