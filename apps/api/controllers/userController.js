const userModel = require('../models/userModel');
const { logAudit } = require('../utils/auditLogger');

// List all users
async function listUsers(req, res, next) {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
}

// Create new user
async function createUser(req, res, next) {
    try {
        const newUser = await userModel.createUser(req.body);

        await logAudit({
            ActionType: 'User Created',
            ChangedBy: req.user.UserId,
            Details: `Created user ${newUser.Username} (${newUser.Role})`
        });

        res.status(201).json(newUser);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        next(err);
    }
}

// Update user
async function updateUser(req, res, next) {
    try {
        const userId = req.params.id;
        const updates = req.body;

        // Prevent modifying own role/status to avoid lockout?
        // Owner can do whatever, but good practice.
        // If modifying self, ensure Role remains Owner?
        // Let's assume Owner knows what they are doing.

        const updatedUser = await userModel.updateUser(userId, updates);

        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        await logAudit({
            ActionType: 'User Updated',
            ChangedBy: req.user.UserId,
            Details: `Updated user ${updatedUser.Username}. Changes: ${Object.keys(updates).join(', ')}`
        });

        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
}

// Delete user
async function deleteUser(req, res, next) {
    try {
        const userId = req.params.id;

        // Prevent deleting self
        if (parseInt(userId) === req.user.UserId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await userModel.deleteUser(userId);

        await logAudit({
            ActionType: 'User Deleted',
            ChangedBy: req.user.UserId,
            Details: `Deleted user ID ${userId}`
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listUsers,
    createUser,
    updateUser,
    deleteUser
};
