const pool = require('../db');

/**
 * Retrieves all service requests with pagination.
 * @param {number} [limit] - Items per page.
 * @param {number} [offset] - Offset.
 * @returns {Promise<{rows: Array, totalCount: number}>} Object containing rows and totalCount.
 */
async function getAllServiceRequests(limit, offset) {
    let query = `SELECT * FROM ServiceRequest ORDER BY DateReceived DESC`;
    const params = [];

    if (limit !== undefined && offset !== undefined) {
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
    }

    const [rows] = await pool.query(query, params);

    // Get total count (for pagination metadata)
    // Note: If filters are added later, this count query needs to match filters.
    const [countResult] = await pool.query(`SELECT COUNT(*) as count FROM ServiceRequest`);
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
    const {
        JobNumber,
        CustomerId,
        PumpsetBrand,
        PumpsetModel,
        HP,
        Warranty,
        SerialNumber,
        DateReceived,
        Notes,
        Status,
        EstimationDate,
        EstimateLink
    } = data;

    const [result] = await pool.query(
        `INSERT INTO ServiceRequest (
      JobNumber, CustomerId, PumpsetBrand, PumpsetModel, HP,
      Warranty, SerialNumber, DateReceived, Notes, Status,
      EstimationDate, EstimateLink
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            JobNumber,
            CustomerId,
            PumpsetBrand,
            PumpsetModel,
            HP,
            Warranty,
            SerialNumber,
            DateReceived,
            Notes,
            Status || 'Estimation in Progress',
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