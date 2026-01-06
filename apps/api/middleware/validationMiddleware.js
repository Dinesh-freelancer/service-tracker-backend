const { body, validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors.
 * If errors exist, responds with 400 Bad Request.
 */
function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

/**
 * Validation rules for user registration.
 */
const registerValidators = [
    body('Username').notEmpty().withMessage('Username is required'),
    body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('Role').isIn(['Admin', 'Owner', 'Worker', 'Customer']).withMessage('Invalid role'),
    body('WorkerId').optional().isInt(),
    body('CustomerId').optional().isInt()
];

/**
 * Validation rules for user login.
 */
const loginValidators = [
    body('Username').notEmpty().withMessage('Username is required'),
    body('Password').notEmpty().withMessage('Password is required')
];

/**
 * Validation rules for creating a customer.
 */
const createCustomerValidators = [
    body('CustomerName').notEmpty().withMessage('Customer Name is required'),
    body('WhatsappNumber').optional().isMobilePhone().withMessage('Invalid Whatsapp Number'),
    body('Email').optional().isEmail().withMessage('Invalid Email Address')
];

/**
 * Validation rules for creating a service request.
 */
const createServiceRequestValidators = [
    body('CustomerId').notEmpty().isInt().withMessage('Valid Customer ID is required'),
    // Optional because we might pass AssetId OR NewAsset object
    body('AssetId').optional().isInt(),
    // Validate NewAsset object if present? Handled in controller logic or custom validator here.
    body('DateReceived').notEmpty().isISO8601().toDate().withMessage('Valid Date Received is required')
];

const validateAsset = [
    body('CustomerId').notEmpty().isInt().withMessage('Customer ID is required'),
    body('PumpBrand').notEmpty().withMessage('Pump Brand is required'),
    body('PumpModel').notEmpty().withMessage('Pump Model is required'),
    validateRequest // Auto-execute validation check
];

module.exports = {
    validateRequest,
    registerValidators,
    loginValidators,
    createCustomerValidators,
    createServiceRequestValidators,
    validateAsset
};
