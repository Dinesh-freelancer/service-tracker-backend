const db = require('../db');

const Leads = {
  create: async (leadData) => {
    const query = `
      INSERT INTO Leads (Name, Phone, PumpType, ApproxWeight, Location)
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

module.exports = Leads;
