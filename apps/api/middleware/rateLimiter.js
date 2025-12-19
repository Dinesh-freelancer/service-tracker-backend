const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes per IP.
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `windowMs`
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

/**
 * Strict Auth Rate Limiter
 * 10 login/register attempts per hour per IP.
 * Prevents brute-force attacks.
 */
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        error: 'Too many login attempts from this IP, please try again after an hour'
    }
});

module.exports = {
    generalLimiter,
    authLimiter
};
