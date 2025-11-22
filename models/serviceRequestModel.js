const pool = require('../db');

// Get all service requests
async function getAllServiceRequests() {
    const [rows] = await pool.query(
        `SELECT * FROM ServiceRequest ORDER BY DateReceived DESC`
    );
    return rows;
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