// middleware/sensitiveInfoToggle.js

function sensitiveInfoToggle(req, res, next) {
  const user = req.user; // From authMiddleware
  console.log("User Role: ",user.Role);
  let hideSensitive = false;

  if (!user) {
    // For unauthenticated requests, default hideSensitive true
    hideSensitive = true;
  } else if (user.Role === 'Worker' || user.Role === 'Customer') {
    // Force hideSensitive true for Workers and Customers
    hideSensitive = true;
  } else if (user.Role === 'Admin' || user.Role === 'Owner') {
    // Admin/Owner can control hideSensitive via query or header (default true)
    // Priority: query param > header > default true
    if (typeof req.query.hideSensitive !== 'undefined') {
      hideSensitive = req.query.hideSensitive === 'true';
    } else if (typeof req.headers['x-hide-sensitive'] !== 'undefined') {
      hideSensitive = req.headers['x-hide-sensitive'] === 'true';
    } else {
      hideSensitive = true;
    }
  } else {
    // Default to true for any other roles, for safety
    hideSensitive = true;
  }

  req.hideSensitive = hideSensitive;
  console.log("Hide Sensitive: "+ req.hideSensitive);

  next();
}

module.exports = sensitiveInfoToggle;
