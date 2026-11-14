const pool = require('../db');

/**
 * List all locations ordered by FullPath.
 */
async function getAllLocations(filters = {}) {
    let query = 'SELECT * FROM locations';
    const whereClauses = [];
    const params = [];

    if (filters.parentLocationId !== undefined && filters.parentLocationId !== '') {
        whereClauses.push('ParentLocationId = ?');
        params.push(parseInt(filters.parentLocationId, 10));
    }

    if (filters.locationType) {
        whereClauses.push('LocationType = ?');
        params.push(filters.locationType);
    }

    if (filters.search) {
        whereClauses.push('(Name LIKE ? OR FullPath LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY FullPath ASC, Name ASC';

    const [rows] = await pool.query(query, params);
    return rows;
}

async function getLocationById(locationId) {
    const [rows] = await pool.query('SELECT * FROM locations WHERE LocationId = ?', [locationId]);
    return rows[0] || null;
}

/**
 * Build FullPath from ParentLocationId and Name.
 */
async function computeFullPath(db, name, parentLocationId) {
    if (!parentLocationId || parentLocationId === 0) {
        return name;
    }
    const [parents] = await db.query('SELECT LocationId, FullPath, Name FROM locations WHERE LocationId = ?', [parentLocationId]);
    if (parents.length === 0) {
        const err = new Error('Parent location not found');
        err.statusCode = 404;
        throw err;
    }
    const parentPath = parents[0].FullPath || parents[0].Name;
    return `${parentPath} > ${name}`;
}

/**
 * Recursively update FullPath for all descendants when a location is renamed or moved.
 */
async function updateDescendantPaths(db, parentId, parentFullPath) {
    const [children] = await db.query('SELECT LocationId, Name FROM locations WHERE ParentLocationId = ?', [parentId]);
    for (const child of children) {
        const childFullPath = `${parentFullPath} > ${child.Name}`;
        await db.query('UPDATE locations SET FullPath = ? WHERE LocationId = ?', [childFullPath, child.LocationId]);
        await updateDescendantPaths(db, child.LocationId, childFullPath);
    }
}

/**
 * Check if candidateId is a descendant of locationId to prevent cycles.
 */
async function isDescendant(db, locationId, candidateParentId) {
    let currentId = candidateParentId;
    while (currentId && currentId !== 0) {
        if (currentId === locationId) return true;
        const [rows] = await db.query('SELECT ParentLocationId FROM locations WHERE LocationId = ?', [currentId]);
        if (rows.length === 0) break;
        currentId = rows[0].ParentLocationId;
    }
    return false;
}

async function createLocation({ Name, LocationType = 'Bin', ParentLocationId = 0 }) {
    const trimmedName = (Name || '').trim();
    if (!trimmedName) {
        const err = new Error('Location Name is required');
        err.statusCode = 400;
        throw err;
    }

    const parentId = ParentLocationId ? parseInt(ParentLocationId, 10) : 0;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const fullPath = await computeFullPath(connection, trimmedName, parentId);
        const [result] = await connection.query(
            `INSERT INTO locations (Name, LocationType, ParentLocationId, FullPath) VALUES (?, ?, ?, ?)`,
            [trimmedName, LocationType, parentId, fullPath]
        );
        await connection.commit();
        return getLocationById(result.insertId);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function updateLocation(locationId, updates) {
    const id = parseInt(locationId, 10);
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existingRows] = await connection.query('SELECT * FROM locations WHERE LocationId = ? FOR UPDATE', [id]);
        if (existingRows.length === 0) {
            await connection.rollback();
            return null;
        }
        const existing = existingRows[0];

        const newName = updates.Name !== undefined ? String(updates.Name).trim() : existing.Name;
        if (!newName) {
            const err = new Error('Location Name cannot be empty');
            err.statusCode = 400;
            throw err;
        }

        const newType = updates.LocationType !== undefined ? updates.LocationType : existing.LocationType;
        const newParentId = updates.ParentLocationId !== undefined
            ? (updates.ParentLocationId ? parseInt(updates.ParentLocationId, 10) : 0)
            : existing.ParentLocationId;

        if (newParentId === id || (newParentId !== 0 && await isDescendant(connection, id, newParentId))) {
            const err = new Error('Cannot set a location as its own parent or move it under its descendant');
            err.statusCode = 400;
            throw err;
        }

        const newFullPath = await computeFullPath(connection, newName, newParentId);

        await connection.query(
            `UPDATE locations SET Name = ?, LocationType = ?, ParentLocationId = ?, FullPath = ? WHERE LocationId = ?`,
            [newName, newType, newParentId, newFullPath, id]
        );

        if (newFullPath !== existing.FullPath) {
            await updateDescendantPaths(connection, id, newFullPath);
        }

        await connection.commit();
        return getLocationById(id);
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

async function deleteLocation(locationId) {
    const id = parseInt(locationId, 10);
    const [children] = await pool.query('SELECT COUNT(*) AS count FROM locations WHERE ParentLocationId = ?', [id]);
    if (children[0].count > 0) {
        const err = new Error('Cannot delete location that has child locations');
        err.statusCode = 409;
        throw err;
    }

    const [stock] = await pool.query('SELECT COUNT(*) AS count FROM inventory_stock WHERE LocationId = ?', [id]);
    if (stock[0].count > 0) {
        const err = new Error('Cannot delete location that is referenced by inventory stock');
        err.statusCode = 409;
        throw err;
    }

    const [result] = await pool.query('DELETE FROM locations WHERE LocationId = ?', [id]);
    return result.affectedRows > 0;
}

module.exports = {
    getAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation
};
