const pool = require('../db');

// Create new windingDetails entry
async function addWindingDetail(data) {
    const [result] = await pool.query(
        `INSERT INTO windingDetails
      (jobNumber, hp, kw, phase, connection_type,
      swg_run, swg_start, swg_3phase,
      wire_id_run, wire_od_run, wire_id_start, wire_od_start,
      wire_id_3phase, wire_od_3phase,
      turns_run, turns_start, turns_3phase,
      slot_turns_run, slot_turns_start, slot_turns_3phase,
      notes)
     VALUES (?, ?, ?, ?, ?,
             ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?,
             ?, ?, ?,
             ?, ?, ?,
             ?)
    `, [
            data.jobNumber, data.hp, data.kw, data.phase, data.connection_type,
            data.swg_run, data.swg_start, data.swg_3phase,
            data.wire_id_run, data.wire_od_run, data.wire_id_start, data.wire_od_start,
            data.wire_id_3phase, data.wire_od_3phase,
            data.turns_run, data.turns_start, data.turns_3phase,
            JSON.stringify(data.slot_turns_run || null),
            JSON.stringify(data.slot_turns_start || null),
            JSON.stringify(data.slot_turns_3phase || null),
            data.notes
        ]
    );
    return await getWindingDetailById(result.insertId);
}

// Get all winding details
async function getAllwindingdetails() {
    const [rows] = await pool.query(`
        SELECT wd.*, sr.Status as JobStatus
        FROM windingDetails wd
        LEFT JOIN servicerequest sr ON wd.jobNumber = sr.JobNumber
        ORDER BY wd.created_at DESC
    `);
    return rows;
}

// Get detail by ID
async function getWindingDetailById(id) {
    const [rows] = await pool.query(`
        SELECT wd.*, sr.Status as JobStatus
        FROM windingDetails wd
        LEFT JOIN servicerequest sr ON wd.jobNumber = sr.JobNumber
        WHERE wd.id = ?
    `, [id]);
    return rows[0];
}

// Get by jobNumber
async function getwindingdetailsByJobNumber(jobNumber) {
    const [rows] = await pool.query(`
        SELECT wd.*, sr.Status as JobStatus
        FROM windingDetails wd
        LEFT JOIN servicerequest sr ON wd.jobNumber = sr.JobNumber
        WHERE wd.jobNumber = ?
    `, [jobNumber]);
    return rows;
}

// Update winding detail
async function updateWindingDetail(id, data) {
    await pool.query(
        `UPDATE windingDetails SET
       hp = ?, kw = ?, phase = ?, connection_type = ?,
       swg_run = ?, swg_start = ?, swg_3phase = ?,
       wire_id_run = ?, wire_od_run = ?, wire_id_start = ?, wire_od_start = ?,
       wire_id_3phase = ?, wire_od_3phase = ?,
       turns_run = ?, turns_start = ?, turns_3phase = ?,
       slot_turns_run = ?, slot_turns_start = ?, slot_turns_3phase = ?,
       notes = ?
     WHERE id = ?`, [
            data.hp, data.kw, data.phase, data.connection_type,
            data.swg_run, data.swg_start, data.swg_3phase,
            data.wire_id_run, data.wire_od_run, data.wire_id_start, data.wire_od_start,
            data.wire_id_3phase, data.wire_od_3phase,
            data.turns_run, data.turns_start, data.turns_3phase,
            JSON.stringify(data.slot_turns_run || null),
            JSON.stringify(data.slot_turns_start || null),
            JSON.stringify(data.slot_turns_3phase || null),
            data.notes,
            id
        ]
    );
    return await getWindingDetailById(id);
}

// Delete entry
async function deleteWindingDetail(id) {
    await pool.query('DELETE FROM windingDetails WHERE id = ?', [id]);
}

module.exports = {
    addWindingDetail,
    getAllwindingdetails,
    getWindingDetailById,
    getwindingdetailsByJobNumber,
    updateWindingDetail,
    deleteWindingDetail
};