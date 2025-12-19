const Leads = require('../models/leadModel');
const { validationResult } = require('express-validator');

exports.createLead = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, pumpType, approxWeight, location } = req.body;

    const newLead = await Leads.create({
      name,
      phone,
      pumpType,
      approxWeight,
      location,
    });

    res.status(201).json({
      message: 'Pickup request received successfully',
      data: newLead,
    });
  } catch (error) {
    next(error);
  }
};
