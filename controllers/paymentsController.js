const paymentsModel = require('../models/paymentsModel');

// List payments (optionally filter by job)
async function listPayments(req, res, next) {
    try {
        const jobNumber = req.query.jobNumber || null;
        const payments = await paymentsModel.getAllPayments(jobNumber);
        res.json(payments);
    } catch (err) {
        next(err);
    }
}

// Get a payment by ID
async function getPayment(req, res, next) {
    try {
        const payment = await paymentsModel.getPaymentById(req.params.paymentId);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        res.json(payment);
    } catch (err) {
        next(err);
    }
}

// Add a payment
async function createPayment(req, res, next) {
    try {
        const payment = await paymentsModel.addPayment(req.body);
        res.status(201).json(payment);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listPayments,
    getPayment,
    createPayment
};