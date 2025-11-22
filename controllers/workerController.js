const workerModel = require('../models/workerModel');

// List all workers
async function listWorkers(req, res, next) {
    try {
        const workers = await workerModel.getAllWorkers();
        res.json(workers);
    } catch (err) {
        next(err);
    }
}

// Get worker by ID
async function getWorker(req, res, next) {
    try {
        const worker = await workerModel.getWorkerById(req.params.workerId);
        if (!worker) return res.status(404).json({ error: 'Worker not found' });
        res.json(worker);
    } catch (err) {
        next(err);
    }
}

// Add new worker
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