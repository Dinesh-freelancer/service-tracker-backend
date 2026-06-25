const pool = require('../db');

async function getAllOrganizations() {
    const [rows] = await pool.query(
        `SELECT * FROM organizations ORDER BY OrganizationName ASC`
    );
    return rows;
}

async function getOrganizationById(id) {
    const [rows] = await pool.query(
        `SELECT * FROM organizations WHERE OrganizationId = ?`,
        [id]
    );
    return rows[0];
}

async function addOrganization(orgData) {
    const {
        OrganizationName,
        Email,
        PrimaryContact,
        Address,
        City,
        State,
        ZipCode,
        GSTNumber,
        OrganizationType
    } = orgData;

    const [result] = await pool.query(
        `INSERT INTO organizations
         (OrganizationName, Email || null, PrimaryContact, Address, City, State, ZipCode, GSTNumber, OrganizationType)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [OrganizationName, Email, PrimaryContact, Address, City, State, ZipCode, GSTNumber, OrganizationType || 'Company']
    );

    return getOrganizationById(result.insertId);
}

module.exports = {
    getAllOrganizations,
    getOrganizationById,
    addOrganization
};
