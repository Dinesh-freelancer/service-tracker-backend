const db = require('../db');

const leads = {
  create: async (leadData) => {
    const query = `
      INSERT INTO leads (Name, Phone, PumpType, ApproxWeight, Location)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      leadData.name,
      leadData.phone,
      leadData.pumpType,
      leadData.approxWeight,
      leadData.location,
    ];

    try {
      const [result] = await db.query(query, params);
      return { id: result.insertId, ...leadData };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = leads;
