const workerModel = require('../models/workerModel');
const { logAudit } = require('../utils/auditLogger');

/**
 * Lists all workers.
 */
async function listWorkers(req, res, next) {
    try {
        const workers = await workerModel.getAllWorkers();
        res.json(workers);
    } catch (err) {
        next(err);
    }
}

/**
 * Retrieves a worker by ID.
 */
async function getWorker(req, res, next) {
    try {
        let worker = await workerModel.getWorkerById(req.params.workerId);
        if (!worker) return res.status(404).json({ error: 'Worker not found' });
        res.json(worker);
    } catch (err) {
        next(err);
    }
}

/**
 * Creates a new worker (optionally with login).
 */
async function createWorker(req, res, next) {
    try {
        const { Username, Password, ...workerData } = req.body;
        let result;

        if (Username && Password) {
            result = await workerModel.addWorkerWithUser(workerData, { Username, Password });
        } else {
            result = await workerModel.addWorker(workerData);
        }

        await logAudit({
            ActionType: 'Worker Created',
            ChangedBy: req.user.UserId,
            Details: `Created worker ${workerData.WorkerName}`
        });

        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function updateWorker(req, res, next) {
    try {
        const result = await workerModel.updateWorker(req.params.id, req.body);

        await logAudit({
            ActionType: 'Worker Updated',
            ChangedBy: req.user.UserId,
            Details: `Updated worker ID ${req.params.id}`
        });

        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function deleteWorker(req, res, next) {
    try {
        await workerModel.deleteWorker(req.params.id);

        await logAudit({
            ActionType: 'Worker Deleted',
            ChangedBy: req.user.UserId,
            Details: `Deleted (Soft) worker ID ${req.params.id}`
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listWorkers,
    getWorker,
    createWorker,
    updateWorker,
    deleteWorker
};
