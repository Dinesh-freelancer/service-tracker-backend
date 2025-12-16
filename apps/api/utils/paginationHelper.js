/**
 * Extracts pagination parameters from the request query.
 * @param {Object} req - The request object.
 * @returns {Object} Object containing page, limit, and offset.
 */
function getPagination(req) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

/**
 * Formats the paginated response data.
 * @param {Array} data - The array of records for the current page.
 * @param {number} page - Current page number.
 * @param {number} limit - Items per page.
 * @param {number} totalItems - Total count of items.
 * @returns {Object} Structured response with data and pagination metadata.
 */
function getPaginationData(data, page, limit, totalItems) {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        data,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit
        }
    };
}

module.exports = {
    getPagination,
    getPaginationData
};
