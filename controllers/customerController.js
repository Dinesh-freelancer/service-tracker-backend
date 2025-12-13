const customerModel = require('../models/customerModel');
const { filterCustomer, filterCustomerList } = require('../utils/responseFilter');
const { AUTH_ROLE_CUSTOMER } = require('../utils/constants');
const { getPagination, getPaginationData } = require('../utils/paginationHelper');

/**
 * Lists customers with pagination, applying role-based filtering and security checks.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
async function listCustomers(req, res, next) {
    try {
        const hideSensitive = req.hideSensitive;
        const role = req.user ? req.user.Role : null;
        const { page, limit, offset } = getPagination(req);

        let rows, totalCount;

        // Security: If Customer, they only see themselves.
        // We can optimize this by only fetching their ID.
        // But getAllCustomers doesn't support filtering by ID yet.
        // Since a customer sees only 1 record, pagination is trivial.

        if (role === AUTH_ROLE_CUSTOMER) {
            if (!req.user.CustomerId) {
                rows = [];
                totalCount = 0;
            } else {
                // Fetch ALL (limitation of current model)
                // Ideally: getCustomerById. But this is list endpoint.
                // We'll stick to filtering the full list in memory for safety/consistency with previous logic,
                // OR better: Just return the single record as a list.
                // Using getCustomerById is safer and faster.
                const singleCustomer = await customerModel.getCustomerById(req.user.CustomerId);
                rows = singleCustomer ? [singleCustomer] : [];
                totalCount = rows.length;
            }
        } else {
            const result = await customerModel.getAllCustomers(limit, offset);
            rows = result.rows;
            totalCount = result.totalCount;
        }

        const filteredCustomers = filterCustomerList(rows, role, hideSensitive);
        const response = getPaginationData(filteredCustomers, page, limit, totalCount);

        res.json(response);
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