const authModel = require('../models/authModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user (Admin/Owner only)
async function register(req, res, next) {
    try {
        const { Username, Password, Role, WorkerId, CustomerId } = req.body;
        const userId = await authModel.registerUser({
            Username,
            Password,
            Role,
            WorkerId,
            CustomerId
        });
        res.status(201).json({ UserId: userId });
    } catch (err) {
        next(err);
    }
}

// Login
async function login(req, res, next) {
    try {
        const { Username, Password } = req.body;
        const user = await authModel.findUserByUsername(Username);
        if (!user || !await bcrypt.compare(Password, user.PasswordHash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // If it's a Customer, let's fetch their OrganizationId so we can embed it in the token
        let userOrgId = null;
        if (user.Role === 'Customer' && user.CustomerId) {
            const customerModel = require('../models/customerModel');
            const customerData = await customerModel.getCustomerById(user.CustomerId);
            if (customerData && customerData.OrganizationId) {
                userOrgId = customerData.OrganizationId;
            }
        }

        const token = jwt.sign({
                UserId: user.UserId,
                Role: user.Role,
                CustomerId: user.CustomerId,
                WorkerId: user.WorkerId,
                OrganizationId: userOrgId
            },
            JWT_SECRET, { expiresIn: '24h' }
        );
        res.json({ token, Role: user.Role });
    } catch (err) {
        next(err);
    }
}

// Reset password
async function resetPassword(req, res, next) {
    try {
        const { Username, NewPassword } = req.body;
        const user = await authModel.findUserByUsername(Username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await authModel.updatePassword(user.UserId, NewPassword);
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    register,
    login,
    resetPassword
};