// middleware/sensitiveInfoToggle.js
const { logAudit } = require('../utils/auditLogger');
const { AUTH_ROLE_WORKER, AUTH_ROLE_CUSTOMER, AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER } = require('../utils/constants');

function sensitiveInfoToggle(req, res, next) {
  const user = req.user; // From authMiddleware

  // Default to true for safety
  let hideSensitive = true;

  if (!user) {
    // Unauthenticated -> hide
    hideSensitive = true;
  } else if (user.Role === AUTH_ROLE_WORKER || user.Role === AUTH_ROLE_CUSTOMER) {
    // Force hideSensitive true for Workers and Customers
    hideSensitive = true;

    // Audit: Detect attempt to disable masking
    const requestedHide = req.query.hideSensitive === 'false' || req.headers['x-hide-sensitive'] === 'false';
    if (requestedHide) {
      logAudit({
        ActionType: 'Unauthorized Sensitive Toggle Attempt',
        ChangedBy: user.UserId,
        Details: `Role ${user.Role} attempted to view sensitive data on ${req.method} ${req.originalUrl}`
      }).catch(console.error);
    }

  } else if (user.Role === AUTH_ROLE_ADMIN || user.Role === AUTH_ROLE_OWNER) {
    // Admin/Owner can control hideSensitive
    if (typeof req.query.hideSensitive !== 'undefined') {
      hideSensitive = req.query.hideSensitive === 'true';
    } else if (typeof req.headers['x-hide-sensitive'] !== 'undefined') {
      hideSensitive = req.headers['x-hide-sensitive'] === 'true';
    } else {
      hideSensitive = true;
    }

    // Audit: Log when sensitive data is explicitly viewed (successfully)
    if (hideSensitive === false) {
      res.on('finish', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
           logAudit({
            ActionType: 'Sensitive Data Viewed',
            ChangedBy: user.UserId,
            Details: `Admin/Owner viewed sensitive data on ${req.method} ${req.originalUrl}`
          }).catch(console.error);
        }
      });
    }
  }

  req.hideSensitive = hideSensitive;

  next();
}

module.exports = sensitiveInfoToggle;
