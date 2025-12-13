/**
 * Centralized error handling middleware.
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
function errorHandler(err, req, res, next) {
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        error: {
            message: message,
            // Only include details in non-production environments if needed
            details: process.env.NODE_ENV === 'development' ? err : undefined
        }
    });
}

module.exports = errorHandler;
