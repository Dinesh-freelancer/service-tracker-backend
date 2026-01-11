// Deprecated: Role-Based Access Control is now enforced in responseFilter.js
module.exports = (req, res, next) => {
    // No-op
    next();
};
