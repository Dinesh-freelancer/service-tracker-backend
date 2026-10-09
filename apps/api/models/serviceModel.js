const db = require('../db');

const getAllServices = async () => {
  const [rows] = await db.query('SELECT * FROM services WHERE IsActive = 1 ORDER BY ServiceName ASC');
  return rows;
};

const getServiceById = async (id) => {
  const [rows] = await db.query('SELECT * FROM services WHERE ServiceId = ?', [id]);
  return rows[0];
};

const createService = async (serviceData) => {
  const { ServiceName, SACCode, DefaultRate, Description } = serviceData;
  const [result] = await db.query(
    'INSERT INTO services (ServiceName, SACCode, DefaultRate, Description) VALUES (?, ?, ?, ?)',
    [ServiceName, SACCode || '998719', DefaultRate || 0, Description || null]
  );
  return result.insertId;
};

const updateService = async (id, serviceData) => {
  const { ServiceName, SACCode, DefaultRate, Description, IsActive } = serviceData;
  await db.query(
    'UPDATE services SET ServiceName = ?, SACCode = ?, DefaultRate = ?, Description = ?, IsActive = ? WHERE ServiceId = ?',
    [ServiceName, SACCode, DefaultRate, Description, IsActive ?? 1, id]
  );
};

const deleteService = async (id) => {
  await db.query('UPDATE services SET IsActive = 0 WHERE ServiceId = ?', [id]);
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
