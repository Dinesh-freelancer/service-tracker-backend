const customerModel = require('../models/customerModel');

// List customers
async function listCustomers(req, res, next) {
    try {
        const customers = await customerModel.getAllCustomers();
        res.json(customers);
    } catch (err) {
        next(err);
    }
}

// Get customer by ID
async function getCustomer(req, res, next) {
    try {
        const customer = await customerModel.getCustomerById(req.params.id);
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        next(err);
    }
}

// Add customer
async function createCustomer(req, res, next) {
    try {
        const customer = await customerModel.addCustomer(req.body);
        res.status(201).json(customer);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listCustomers,
    getCustomer,
    createCustomer
};