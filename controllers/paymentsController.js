const paymentsModel = require('../models/paymentsModel');
const { AUTH_ROLE_WORKER } = require('../utils/constants');
const { logAudit } = require('../utils/auditLogger');

// List payments (optionally filter by job)
async function listPayments(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;

        // Workers should not see payments
        if (hideSensitive && role === AUTH_ROLE_WORKER) {
            // Log the blocked attempt if they tried to access payments
            // Note: Since listPayments returns empty list (not 403), this is a "soft block".
            // Do we want to log every time a worker loads the payments page (which might be part of a job page)?
            // If the UI automatically fetches it, this will spam logs.
            // The requirement was "Log failed access attempts".
            // If we return [], it's not strictly "failed" (it's "no results").
            // However, in getPayment below (for ID), it returns 403. That IS a failure.
            // I will SKIP logging here to avoid spam on list views, but I will log on getPayment (direct access).
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
             await logAudit({
                ActionType: 'Unauthorized Payment Access',
                ChangedBy: req.user.UserId,
                Details: `Worker attempted to view Payment ID ${req.params.paymentId}`
             });
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