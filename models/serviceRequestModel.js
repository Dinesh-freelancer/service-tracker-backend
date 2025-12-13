const pool = require('../db');

/**
 * Retrieves all service requests with pagination and filtering.
 * @param {Object} [filters] - Search filters.
 * @param {string} [filters.sql] - WHERE clause.
 * @param {Array} [filters.params] - Parameters for WHERE clause.
 * @param {number} [limit] - Items per page.
 * @param {number} [offset] - Offset.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and totalCount.
 */
async function getAllServiceRequests(filters = {}, limit, offset) {
    let query = `SELECT * FROM ServiceRequest`;
    const params = [];

    if (filters.sql) {
        query += ` ${filters.sql}`;
        params.push(...filters.params);
    }

    query += ` ORDER BY DateReceived DESC`;

    if (limit !== undefined && offset !== undefined) {
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
    }

    const [rows] = await pool.query(query, params);

    // Get total count (using same filters)
    let countQuery = `SELECT COUNT(*) as count FROM ServiceRequest`;
    const countParams = [];
    if (filters.sql) {
        countQuery += ` ${filters.sql}`;
        countParams.push(...filters.params);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const totalCount = countResult[0].count;

    return { rows, totalCount };
}

// Get service request by JobNumber
async function getServiceRequestByJobNumber(jobNumber) {
    const [rows] = await pool.query(
        `SELECT * FROM ServiceRequest WHERE JobNumber = ?`, [jobNumber]
    );
    return rows[0];
}

// Create new service request
async function addServiceRequest(data) {
    let {
        JobNumber,
        CustomerId,
        PumpBrand,
        PumpModel,
        MotorBrand,
        MotorModel,
        HP,
        Warranty,
        SerialNumber,
        DateReceived,
        Notes,
        Status,
        EstimationDate,
        EstimateLink
    } = data;

    // Generate JobNumber if not provided
    if (!JobNumber) {
        // Format: YYYYMMDDNN (e.g., 20251115001)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        // Fetch last job number for today
        const [rows] = await pool.query(
            `SELECT JobNumber FROM ServiceRequest WHERE JobNumber LIKE ? ORDER BY JobNumber DESC LIMIT 1`,
            [`${dateStr}%`]
        );
        let nextSeq = 1;
        if (rows.length > 0) {
            const lastSeq = parseInt(rows[0].JobNumber.slice(-3), 10);
            nextSeq = lastSeq + 1;
        }
        JobNumber = `${dateStr}${String(nextSeq).padStart(3, '0')}`;
    }

    // Default to 'Received' if not provided (matching DB default)
    Status = Status || 'Received';

    const [result] = await pool.execute(
        `INSERT INTO ServiceRequest (
      JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP,
      Warranty, SerialNumber, DateReceived, Notes, Status,
      EstimationDate, EstimateLink
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            JobNumber,
            CustomerId,
            PumpBrand,
            PumpModel,
            MotorBrand,
            MotorModel,
            HP,
            Warranty,
            SerialNumber,
            DateReceived,
            Notes,
            Status,
            EstimationDate,
            EstimateLink
        ]
    );
    return await getServiceRequestByJobNumber(JobNumber);
}

module.exports = {
    getAllServiceRequests,
    getServiceRequestByJobNumber,
    addServiceRequest
};