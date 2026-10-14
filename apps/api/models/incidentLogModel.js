const db = require('../db');

const getAllIncidentLogs = async (filters = {}) => {
  const { dateFrom, dateTo, logType, workerId, search } = filters;
  let query = `
    SELECT
      l.*,
      u.Username as CreatedByName,
      GROUP_CONCAT(DISTINCT w.WorkerId) as WorkerIds,
      GROUP_CONCAT(DISTINCT w.WorkerName SEPARATOR ', ') as WorkerNames
    FROM incident_logs l
    LEFT JOIN users u ON l.CreatedBy = u.UserId
    LEFT JOIN incident_log_workers ilw ON l.LogId = ilw.LogId
    LEFT JOIN worker w ON ilw.WorkerId = w.WorkerId
    WHERE 1=1
  `;
  const params = [];

  if (dateFrom) {
    query += ' AND l.LogDate >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    query += ' AND l.LogDate <= ?';
    params.push(dateTo);
  }
  if (logType) {
    query += ' AND l.LogType = ?';
    params.push(logType);
  }
  if (workerId) {
    query += ' AND l.LogId IN (SELECT LogId FROM incident_log_workers WHERE WorkerId = ?)';
    params.push(workerId);
  }
  if (search) {
    query += ' AND (l.Title LIKE ? OR l.Description LIKE ? OR l.JobNumber LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ' GROUP BY l.LogId ORDER BY l.LogDate DESC, l.CreatedAt DESC';

  const [rows] = await db.query(query, params);
  return rows.map((r) => ({
    ...r,
    WorkerIds: r.WorkerIds ? r.WorkerIds.split(',').map(Number) : [],
  }));
};

const getIncidentLogById = async (logId) => {
  const [rows] = await db.query(
    `SELECT
      l.*,
      u.Username as CreatedByName,
      GROUP_CONCAT(DISTINCT w.WorkerId) as WorkerIds,
      GROUP_CONCAT(DISTINCT w.WorkerName SEPARATOR ', ') as WorkerNames
    FROM incident_logs l
    LEFT JOIN users u ON l.CreatedBy = u.UserId
    LEFT JOIN incident_log_workers ilw ON l.LogId = ilw.LogId
    LEFT JOIN worker w ON ilw.WorkerId = w.WorkerId
    WHERE l.LogId = ?
    GROUP BY l.LogId`,
    [logId]
  );

  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    ...row,
    WorkerIds: row.WorkerIds ? row.WorkerIds.split(',').map(Number) : [],
  };
};

const createIncidentLog = async (logData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      LogType = 'General',
      LogDate,
      Title,
      Description,
      Severity = 'Info',
      JobNumber,
      EmbedTag,
      CreatedBy,
      WorkerIds = [],
    } = logData;

    const [result] = await connection.query(
      `INSERT INTO incident_logs
      (LogType, LogDate, Title, Description, Severity, JobNumber, EmbedTag, CreatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        LogType,
        LogDate,
        Title,
        Description || null,
        Severity,
        JobNumber || null,
        EmbedTag || null,
        CreatedBy,
      ]
    );

    const logId = result.insertId;

    if (Array.isArray(WorkerIds) && WorkerIds.length > 0) {
      for (const wId of WorkerIds) {
        await connection.query(
          'INSERT INTO incident_log_workers (LogId, WorkerId) VALUES (?, ?)',
          [logId, wId]
        );
      }
    }

    await connection.commit();
    return logId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateIncidentLog = async (logId, logData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const {
      LogType,
      LogDate,
      Title,
      Description,
      Severity,
      JobNumber,
      EmbedTag,
      WorkerIds = [],
    } = logData;

    await connection.query(
      `UPDATE incident_logs
      SET LogType = ?, LogDate = ?, Title = ?, Description = ?, Severity = ?, JobNumber = ?, EmbedTag = ?
      WHERE LogId = ?`,
      [
        LogType,
        LogDate,
        Title,
        Description || null,
        Severity,
        JobNumber || null,
        EmbedTag || null,
        logId,
      ]
    );

    // Update worker associations
    await connection.query('DELETE FROM incident_log_workers WHERE LogId = ?', [logId]);

    if (Array.isArray(WorkerIds) && WorkerIds.length > 0) {
      for (const wId of WorkerIds) {
        await connection.query(
          'INSERT INTO incident_log_workers (LogId, WorkerId) VALUES (?, ?)',
          [logId, wId]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteIncidentLog = async (logId) => {
  await db.query('DELETE FROM incident_logs WHERE LogId = ?', [logId]);
};

module.exports = {
  getAllIncidentLogs,
  getIncidentLogById,
  createIncidentLog,
  updateIncidentLog,
  deleteIncidentLog,
};
