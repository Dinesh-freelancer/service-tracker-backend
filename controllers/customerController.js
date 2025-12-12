const customerModel = require('../models/customerModel');
const { filterCustomer, filterCustomerList } = require('../utils/responseFilter');
const { AUTH_ROLE_CUSTOMER } = require('../utils/constants');

// List customers
async function listCustomers(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        let customers = await customerModel.getAllCustomers();

        // Security: If Customer, filter by ownership
        if (role === AUTH_ROLE_CUSTOMER) {
            if (!req.user.CustomerId) {
                customers = [];
            } else {
                customers = customers.filter(c => c.CustomerId === req.user.CustomerId);
            }
        }

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

        // Security: If Customer, verify ownership
        if (role === AUTH_ROLE_CUSTOMER) {
             // Params ID is string, CustomerId is int, use loose equality or parse
            if (!req.user.CustomerId || customer.CustomerId != req.user.CustomerId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

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