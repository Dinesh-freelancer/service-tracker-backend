/**
 * Builds a dynamic SQL WHERE clause and parameters from query filters.
 * @param {Object} query - The request query object.
 * @param {Array<string>} searchableFields - List of columns to apply text search on.
 * @returns {Object} Object containing { sql, params }.
 */
function buildSearchFilters(query, searchableFields = []) {
    let sqlParts = [];
    let params = [];

    // General Text Search
    if (query.search && searchableFields.length > 0) {
        const searchTerm = `%${query.search}%`;
        const searchConditions = searchableFields.map(field => `${field} LIKE ?`).join(' OR ');
        sqlParts.push(`(${searchConditions})`);
        searchableFields.forEach(() => params.push(searchTerm));
    }

    // Exact Match Filters (e.g. status=Open)
    // We explicitly exclude reserved keys like page, limit, search, sortBy, sortOrder
    const reservedKeys = ['page', 'limit', 'search', 'sortBy', 'sortOrder', 'hideSensitive'];

    Object.keys(query).forEach(key => {
        if (!reservedKeys.includes(key)) {
            // Basic SQL injection prevention: only allow alphanumeric keys (though keys come from code logic usually)
            // But here keys come from user. We should ideally whitelist them in the controller.
            // For now, we assume controller passes only safe keys or we handle them generically.
            // However, to be safe, we will just use the key as is but ensure it is a valid column name style.
            if (/^[a-zA-Z0-9_]+$/.test(key)) {
                sqlParts.push(`${key} = ?`);
                params.push(query[key]);
            }
        }
    });

    const sql = sqlParts.length > 0 ? `WHERE ${sqlParts.join(' AND ')}` : '';

    return { sql, params };
}

module.exports = {
    buildSearchFilters
};
