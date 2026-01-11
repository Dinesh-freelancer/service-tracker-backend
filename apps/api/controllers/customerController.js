const customerModel = require('../models/customerModel');
const { filterCustomer, filterCustomerList } = require('../utils/responseFilter');
const { AUTH_ROLE_CUSTOMER } = require('../utils/constants');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');
const { buildSearchFilters } = require('../utils/queryHelper');

/**
 * Lists customers with pagination and filtering.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listCustomers(req, res, next) {
    try {
        const role = req.user ? req.user.Role : null;
        const { page, limit, offset } = getPagination(req);

        const searchableFields = ['CustomerName', 'WhatsappNumber'];
        const filters = buildSearchFilters(req.query, searchableFields);

        let rows, totalCount;

        if (role === AUTH_ROLE_CUSTOMER) {
            if (!req.user.CustomerId) {
                rows = [];
                totalCount = 0;
            } else {
                // If Customer is searching, they only search within their own record?
                // Or we just return their record. Search filters are irrelevant if they see 1 record.
                const singleCustomer = await customerModel.getCustomerById(req.user.CustomerId);
                rows = singleCustomer ? [singleCustomer] : [];
                totalCount = rows.length;
            }
        } else {
            const result = await customerModel.getAllCustomers(filters, limit, offset);
            rows = result.rows;
            totalCount = result.totalCount;
        }

        const filteredCustomers = filterCustomerList(rows, role);
        const response = getPaginationData(filteredCustomers, page, limit, totalCount);

        res.json(response);
    } catch (err) {
        next(err);
    }
}

// Get customer by ID
async function getCustomer(req, res, next) {
    try {
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

        customer = filterCustomer(customer, role);

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