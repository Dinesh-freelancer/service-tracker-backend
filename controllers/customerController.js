const customerModel = require('../models/customerModel');
const {STRING_HIDDEN} = require('../utils/constants');
// List customers
async function listCustomers(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let customers = await customerModel.getAllCustomers();
        if (hideSensitive) {
            customers = customers.map(customer => ({
                "CustomerId": customer.CustomerId,
                "CustomerName": STRING_HIDDEN,
                "CompanyName": STRING_HIDDEN,
                "Address": STRING_HIDDEN,
                "WhatsappNumber": STRING_HIDDEN,
                "WhatsappSameAsMobile": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            }));
        }
        res.json(customers);
    } catch (err) {
        next(err);
    }
}

// Get customer by ID
async function getCustomer(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        let customer = await customerModel.getCustomerById(req.params.id);

        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        if(hideSensitive){
            customer = {
                "CustomerId": customer.CustomerId,
                "CustomerName": STRING_HIDDEN,
                "CompanyName": STRING_HIDDEN,
                "Address": STRING_HIDDEN,
                "WhatsappNumber": STRING_HIDDEN,
                "WhatsappSameAsMobile": STRING_HIDDEN,
                "CreatedAt": STRING_HIDDEN,
                "UpdatedAt": STRING_HIDDEN
            };
        }
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