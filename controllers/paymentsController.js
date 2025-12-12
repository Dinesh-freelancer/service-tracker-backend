const paymentsModel = require('../models/paymentsModel');
const serviceRequestModel = require('../models/serviceRequestModel'); // For ownership check
const { AUTH_ROLE_WORKER, AUTH_ROLE_CUSTOMER } = require('../utils/constants');
const { logAudit } = require('../utils/auditLogger');

// List payments (optionally filter by job)
async function listPayments(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;

        // Workers should not see payments
        if (hideSensitive && role === AUTH_ROLE_WORKER) {
            return res.json([]);
        }

        // Security: If Customer, only return their payments
        if (role === AUTH_ROLE_CUSTOMER) {
             if (!req.user.CustomerId) {
                 return res.json([]);
             }
             const payments = await paymentsModel.getPaymentsByCustomerId(req.user.CustomerId);
             // If a specific job was requested, filter the result further
             if (req.query.jobNumber) {
                 const filtered = payments.filter(p => p.JobNumber === req.query.jobNumber);
                 return res.json(filtered);
             }
             return res.json(payments);
        }

        const jobNumber = req.query.jobNumber || null;
        let payments = await paymentsModel.getAllPayments(jobNumber);

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

        // Security: If Customer, verify ownership via Job
        if (role === AUTH_ROLE_CUSTOMER) {
            if (!req.user.CustomerId) {
                 return res.status(403).json({ error: 'Access denied' });
            }
            const job = await serviceRequestModel.getServiceRequestByJobNumber(payment.JobNumber);
            if (!job || job.CustomerId !== req.user.CustomerId) {
                 return res.status(403).json({ error: 'Access denied' });
            }
        }

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