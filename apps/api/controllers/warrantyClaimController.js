const warrantyClaimModel = require('../models/warrantyClaimModel');
const ServiceRequest = require('../models/serviceRequestModel');

const warrantyClaimController = {
  getClaim: async (req, res) => {
    try {
      const { jobNumber } = req.params;
      const claim = await warrantyClaimModel.getClaimByJobNumber(jobNumber);

      if (!claim) {
        return res.status(404).json({ message: 'Warranty claim not found' });
      }

      // Parse PartReplacementDetails back to JSON object if it's a string
      if (typeof claim.PartReplacementDetails === 'string') {
          try {
              claim.PartReplacementDetails = JSON.parse(claim.PartReplacementDetails);
          } catch(e) {
              console.error('Error parsing PartReplacementDetails JSON', e);
          }
      }

      res.status(200).json(claim);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving warranty claim' });
    }
  },

  updateClaim: async (req, res) => {
    try {
      const { jobNumber } = req.params;

      const updateData = { ...req.body };

      // Handle empty string for OEMCreditNoteAmount
      if (updateData.OEMCreditNoteAmount === "") {
        updateData.OEMCreditNoteAmount = null;
      }

      const claimExists = await warrantyClaimModel.getClaimByJobNumber(jobNumber);
      if(!claimExists) {
           await warrantyClaimModel.createClaim(jobNumber, updateData);
      } else {
           await warrantyClaimModel.updateClaim(jobNumber, updateData);
      }

      res.status(200).json({ message: 'Warranty claim updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating warranty claim' });
    }
  }
};

module.exports = warrantyClaimController;
