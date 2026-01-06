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

        // Handle fields that might be ambiguous by adding alias prefixes if not present
        // However, standard fields in searchableFields usually come from controller which knows the alias.
        // E.g., 'a.InternalTag' or 'sr.JobNumber'.
        // If the field name doesn't have a dot, we assume it's unique or the default table.
        // But to be safe with JOINS, controllers should pass 'a.InternalTag'.

        const searchConditions = searchableFields.map(field => `${field} LIKE ?`).join(' OR ');
        sqlParts.push(`(${searchConditions})`);
        searchableFields.forEach(() => params.push(searchTerm));
    }

    // Exact Match Filters (e.g. status=Open)
    // We explicitly exclude reserved keys like page, limit, search, sortBy, sortOrder
    const reservedKeys = ['page', 'limit', 'search', 'sortBy', 'sortOrder', 'hideSensitive', 'customerId'];

    Object.keys(query).forEach(key => {
        if (!reservedKeys.includes(key)) {
            // Basic SQL injection prevention
            if (/^[a-zA-Z0-9_]+$/.test(key)) {
                // Determine table alias for common fields to avoid ambiguity
                let column = key;
                if (key === 'Status' || key === 'JobNumber') column = `sr.${key}`;
                else if (key === 'InternalTag') column = `a.${key}`;
                else if (key === 'CustomerName') column = `c.${key}`;

                sqlParts.push(`${column} = ?`);
                params.push(query[key]);
            }
        }
    });

    // Explicitly handle customerId if present (common filter)
    if (query.customerId) {
        sqlParts.push(`sr.CustomerId = ?`);
        params.push(query.customerId);
    }

    const sql = sqlParts.length > 0 ? `WHERE ${sqlParts.join(' AND ')}` : '';

    return { sql, params };
}

module.exports = {
    buildSearchFilters
};
