const serviceModel = require('../models/serviceModel');

const getAllServices = async (req, res) => {
  try {
    const services = await serviceModel.getAllServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await serviceModel.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createService = async (req, res) => {
  try {
    const { ServiceName, SACCode, DefaultRate, Description } = req.body;
    if (!ServiceName) return res.status(400).json({ error: 'Service name is required' });

    const insertId = await serviceModel.createService({ ServiceName, SACCode, DefaultRate, Description });
    res.status(201).json({ ServiceId: insertId, ServiceName, SACCode, DefaultRate, Description });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    const { ServiceName, SACCode, DefaultRate, Description, IsActive } = req.body;
    await serviceModel.updateService(req.params.id, { ServiceName, SACCode, DefaultRate, Description, IsActive });
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    await serviceModel.deleteService(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
