const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    validateRequest,
    registerValidators,
    loginValidators
} = require('../middleware/validationMiddleware');

// POST /api/auth/register
router.post('/register', registerValidators, validateRequest, authController.register);

// POST /api/auth/login
router.post('/login', loginValidators, validateRequest, authController.login);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;