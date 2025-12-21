const pool = require('../db');

/**
 * Get all customers with optional filters and pagination.
 * Joins with Organizations to provide full details.
 */
async function getAllCustomers(filters = {}, limit = 10, offset = 0) {
    // Select from customerdetails and join organizations
    let query = `
        SELECT c.*, o.OrganizationName, o.OrganizationType
        FROM customerdetails c
        LEFT JOIN organizations o ON c.OrganizationId = o.OrganizationId
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM customerdetails c LEFT JOIN organizations o ON c.OrganizationId = o.OrganizationId';
    let params = [];
    let whereClauses = [];

    // Filter logic
    if (filters.search) {
        // Search in Name, Org Name, or Primary Contact
        whereClauses.push('(c.CustomerName LIKE ? OR o.OrganizationName LIKE ? OR c.PrimaryContact LIKE ?)');
        const term = `%${filters.search}%`;
        params.push(term, term, term);
    }

    if (filters.type) {
        whereClauses.push('c.CustomerType = ?');
        params.push(filters.type);
    }

    if (whereClauses.length > 0) {
        const whereSql = ' WHERE ' + whereClauses.join(' AND ');
        query += whereSql;
        countQuery += whereSql;
    }

    query += ' ORDER BY c.CreatedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    // Count query for pagination (need separate params without limit/offset)
    let countParams = params.slice(0, -2);
    const [countRows] = await pool.query(countQuery, countParams);
    const totalCount = countRows[0].count;

    return { rows, totalCount };
}

async function getCustomerById(id) {
    const [rows] = await pool.query(`
        SELECT c.*, o.OrganizationName, o.OrganizationType
        FROM customerdetails c
        LEFT JOIN organizations o ON c.OrganizationId = o.OrganizationId
        WHERE c.CustomerId = ?
    `, [id]);

    if (rows.length > 0) {
        // Fetch mobile numbers
        const [mobiles] = await pool.query('SELECT MobileNumber FROM customermobilenumbers WHERE CustomerId = ?', [id]);
        rows[0].MobileNumbers = mobiles.map(m => m.MobileNumber);
    }

    return rows[0];
}

/**
 * Add a new customer.
 * Supports new schema fields: OrganizationId, CustomerType, PrimaryContact.
 * Also inserts additional mobile numbers into customermobilenumbers table.
 */
async function addCustomer(customerData) {
    const {
        CustomerName,
        Address,
        City,
        State,
        ZipCode,
        PrimaryContact, // Renamed from Phone1/Whatsapp
        Email,
        Notes,
        OrganizationId,
        CustomerType, // 'Individual' or 'OrganizationMember'
        Designation,
        MobileNumbers = [] // Array of additional numbers
    } = customerData;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `INSERT INTO customerdetails
            (CustomerName, Address, City, State, ZipCode, PrimaryContact, Email, Notes, OrganizationId, CustomerType, Designation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [CustomerName, Address, City, State, ZipCode, PrimaryContact, Email, Notes, OrganizationId || null, CustomerType || 'Individual', Designation]
        );

        const newCustomerId = result.insertId;

        // Insert additional mobile numbers if any
        if (MobileNumbers && MobileNumbers.length > 0) {
            const mobileValues = MobileNumbers.map(num => [newCustomerId, num]);
            await connection.query(
                `INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES ?`,
                [mobileValues]
            );
        }

        await connection.commit();
        return getCustomerById(newCustomerId); // Reuse getById to return full object
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function updateCustomer(id, customerData) {
    // Handle MobileNumbers update separately if present
    const { MobileNumbers, ...updateFields } = customerData;

    // Map keys to DB column names if needed, but assuming standard match for now
    // Note: PrimaryContact might be passed as 'Phone1' by legacy frontend, so we handle that in controller or here if needed.
    // For now assuming controller passes correct keys.

    const fields = Object.keys(updateFields).map(field => `${field} = ?`);
    const values = Object.values(updateFields);
    values.push(id);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (fields.length > 0) {
            await connection.query(`UPDATE customerdetails SET ${fields.join(', ')} WHERE CustomerId = ?`, values);
        }

        // Update mobile numbers (Full replacement strategy for simplicity)
        if (MobileNumbers) {
            await connection.query('DELETE FROM customermobilenumbers WHERE CustomerId = ?', [id]);
            if (MobileNumbers.length > 0) {
                const mobileValues = MobileNumbers.map(num => [id, num]);
                await connection.query(
                    `INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES ?`,
                    [mobileValues]
                );
            }
        }

        await connection.commit();
        return getCustomerById(id);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function deleteCustomer(id) {
    await pool.query('DELETE FROM customerdetails WHERE CustomerId = ?', [id]);
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer
};
