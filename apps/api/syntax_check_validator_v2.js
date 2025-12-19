try {
    require('express-validator');
    require('./middleware/errorHandler');
    require('./middleware/validationMiddleware');
    // Mock express router for routes
    const express = require('express');
    const originalRouter = express.Router;
    express.Router = () => ({
        use: () => {},
        get: () => {},
        post: () => {},
        put: () => {},
        delete: () => {}
    });

    // We can require routes now safely if controllers don't throw on load
    require('./routes/auth');
    require('./routes/customers');
    require('./routes/serviceRequests');

    console.log("Syntax check passed");
} catch (e) {
    console.error(e);
    process.exit(1);
}
