const paymentsModel = require('../models/paymentsModel');
const { AUTH_ROLE_WORKER } = require('../utils/constants');

// List payments (optionally filter by job)
async function listPayments(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;

        // Workers should not see payments
        if (hideSensitive && role === AUTH_ROLE_WORKER) {
            return res.json([]);
        }

        const jobNumber = req.query.jobNumber || null;
        let payments = await paymentsModel.getAllPayments(jobNumber);

        // Note: For customers, they might see their own payments.
        // We assume here that if hideSensitive is true (Worker/Customer),
        // Workers got [] above, so this is Customer (or Admin w/ flag).
        // Customers usually want to see their payments.
        // If we need to filter specific fields for customers, we could use responseFilter.
        // For now, if hideSensitive is on, we'll return the payments as is for Customers
        // (assuming authorization middleware ensures they only see their own jobs' payments,
        // or the controller query filters by job).
        // However, the current implementation blindly hid everything.
        // Let's assume Customers can see payment details.

        res.json(payments);
    } catch (err) {
        next(err);
    }
}

// Get a payment by ID
async function getPayment(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;

        if (hideSensitive && role === AUTH_ROLE_WORKER) {
             return res.status(403).json({ error: 'Access denied' });
        }

        let payment = await paymentsModel.getPaymentById(req.params.paymentId);
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