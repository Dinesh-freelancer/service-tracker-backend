const pool = require('../db');

const warrantyClaimModel = {
  getClaimByJobNumber: async (jobNumber) => {
    const [rows] = await pool.query(`SELECT * FROM warranty_claims WHERE JobNumber = ?`, [jobNumber]);
    return rows[0];
  },

  createClaim: async (jobNumber, claimData = {}, connection = null) => {
    const db = connection || pool;
    const { OEMManufacturer = null, WarrantyStatus = 'Pending SR Completion', ClaimReferenceNumber = null, PartReplacementDetails = null, OEMCreditNoteAmount = null } = claimData;
    const [result] = await db.query(
      `INSERT INTO warranty_claims (JobNumber, OEMManufacturer, WarrantyStatus, ClaimReferenceNumber, PartReplacementDetails, OEMCreditNoteAmount)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       OEMManufacturer = VALUES(OEMManufacturer), WarrantyStatus = VALUES(WarrantyStatus), ClaimReferenceNumber = VALUES(ClaimReferenceNumber), PartReplacementDetails = VALUES(PartReplacementDetails), OEMCreditNoteAmount = VALUES(OEMCreditNoteAmount)`,
      [jobNumber, OEMManufacturer, WarrantyStatus, ClaimReferenceNumber, JSON.stringify(PartReplacementDetails), OEMCreditNoteAmount]
    );
    return result;
  },

  updateClaim: async (jobNumber, updateData) => {
    const allowedFields = ['OEMManufacturer', 'WarrantyStatus', 'ClaimReferenceNumber', 'PartReplacementDetails', 'OEMCreditNoteAmount'];
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(key === 'PartReplacementDetails' ? JSON.stringify(updateData[key]) : updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    values.push(jobNumber);

    const [result] = await pool.query(
      `UPDATE warranty_claims SET ${fields.join(', ')} WHERE JobNumber = ?`,
      values
    );

    return result;
  }
};

module.exports = warrantyClaimModel;
