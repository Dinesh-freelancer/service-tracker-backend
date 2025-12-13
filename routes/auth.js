const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
    validateRequest,
    registerValidators,
    loginValidators
} = require('../middleware/validationMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/register
router.post('/register', authLimiter, registerValidators, validateRequest, authController.register);

// POST /api/auth/login
router.post('/login', authLimiter, loginValidators, validateRequest, authController.login);

// POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

module.exports = router;