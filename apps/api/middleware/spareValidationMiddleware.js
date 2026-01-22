const { validationResult, body } = require('express-validator');

// Validation rules for Spare Upsert
const validateSpareUpsert = [
    body('pumpCategory')
        .trim().notEmpty().withMessage('pumpCategory is required'),
    body('pumpType')
        .trim().notEmpty().withMessage('pumpType is required'),
    body('pumpSize')
        .trim().notEmpty().withMessage('pumpSize is required'),
    body('spareName')
        .trim().notEmpty().withMessage('spareName is required'),
    body('basicMaterial')
        .trim().notEmpty().withMessage('basicMaterial is required'),
    body('unitPrice')
        .isFloat({ min: 0 }).withMessage('unitPrice must be a positive number'),
    body('uom')
        .trim().notEmpty().withMessage('uom is required'),

    // Optional fields need trimming but no error if empty (unless we want to force empty string to null, handled in controller/model)
    body('partNo').optional().trim(),
    body('sapMaterial').optional().trim(),

    // Middleware to check results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        next();
    }
];

module.exports = {
    validateSpareUpsert
};
