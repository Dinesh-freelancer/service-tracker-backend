const incidentLogModel = require('../models/incidentLogModel');

const getAllIncidentLogs = async (req, res) => {
  try {
    const { dateFrom, dateTo, logType, workerId, search } = req.query;
    const logs = await incidentLogModel.getAllIncidentLogs({
      dateFrom,
      dateTo,
      logType,
      workerId,
      search,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getIncidentLogById = async (req, res) => {
  try {
    const log = await incidentLogModel.getIncidentLogById(req.params.id);
    if (!log) return res.status(404).json({ error: 'Incident log not found' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createIncidentLog = async (req, res) => {
  try {
    const {
      LogType = 'General',
      LogDate,
      Title,
      Description,
      Severity = 'Info',
      JobNumber,
      EmbedTag,
      WorkerIds = [],
    } = req.body;

    if (!LogDate) return res.status(400).json({ error: 'LogDate is required' });
    if (!Title) return res.status(400).json({ error: 'Title is required' });

    // Validate Labour log requirements
    if (LogType === 'Labour' && (!WorkerIds || WorkerIds.length === 0)) {
      return res.status(400).json({ error: 'At least one worker must be selected for Labour logs' });
    }

    const logId = await incidentLogModel.createIncidentLog({
      LogType,
      LogDate,
      Title,
      Description,
      Severity,
      JobNumber,
      EmbedTag,
      CreatedBy: req.user?.id || req.user?.UserId || 1,
      WorkerIds,
    });

    const newLog = await incidentLogModel.getIncidentLogById(logId);
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateIncidentLog = async (req, res) => {
  try {
    const {
      LogType,
      LogDate,
      Title,
      Description,
      Severity,
      JobNumber,
      EmbedTag,
      WorkerIds = [],
    } = req.body;

    if (!LogDate) return res.status(400).json({ error: 'LogDate is required' });
    if (!Title) return res.status(400).json({ error: 'Title is required' });

    if (LogType === 'Labour' && (!WorkerIds || WorkerIds.length === 0)) {
      return res.status(400).json({ error: 'At least one worker must be selected for Labour logs' });
    }

    await incidentLogModel.updateIncidentLog(req.params.id, {
      LogType,
      LogDate,
      Title,
      Description,
      Severity,
      JobNumber,
      EmbedTag,
      WorkerIds,
    });

    const updated = await incidentLogModel.getIncidentLogById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteIncidentLog = async (req, res) => {
  try {
    await incidentLogModel.deleteIncidentLog(req.params.id);
    res.json({ message: 'Incident log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllIncidentLogs,
  getIncidentLogById,
  createIncidentLog,
  updateIncidentLog,
  deleteIncidentLog,
};
