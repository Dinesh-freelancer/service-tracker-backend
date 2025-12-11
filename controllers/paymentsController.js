const paymentsModel = require('../models/paymentsModel');
const { STRING_HIDDEN } = require('../utils/constants');

// List payments (optionally filter by job)
async function listPayments(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const jobNumber = req.query.jobNumber || null;
        let payments = await paymentsModel.getAllPayments(jobNumber);
        if (hideSensitive) {
            payments = payments.map(item => ({
                "PaymentId": item.PaymentId,
                "JobNumber": STRING_HIDDEN,
                "Amount": STRING_HIDDEN,
                "PaymentDate": STRING_HIDDEN,
                "PaymentType": STRING_HIDDEN,
                "PaymentMode": STRING_HIDDEN,
                "Notes": STRING_HIDDEN
            }));
        }
        res.json(payments);
    } catch (err) {
        next(err);
    }
}

// Get a payment by ID
async function getPayment(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let payment = await paymentsModel.getPaymentById(req.params.paymentId);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });
        if(hideSensitive){
            payment = {
                "PaymentId": payment.PaymentId,
                "JobNumber": STRING_HIDDEN,
                "Amount": STRING_HIDDEN,
                "PaymentDate": STRING_HIDDEN,
                "PaymentType": STRING_HIDDEN,
                "PaymentMode": STRING_HIDDEN,
                "Notes": STRING_HIDDEN
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