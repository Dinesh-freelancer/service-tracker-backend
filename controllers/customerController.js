const customerModel = require('../models/customerModel');
const { filterCustomer, filterCustomerList } = require('../utils/responseFilter');

// List customers
async function listCustomers(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let customers = await customerModel.getAllCustomers();

        customers = filterCustomerList(customers, role, hideSensitive);

        res.json(customers);
    } catch (err) {
        next(err);
    }
}

// Get customer by ID
async function getCustomer(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let customer = await customerModel.getCustomerById(req.params.id);

        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        customer = filterCustomer(customer, role, hideSensitive);

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