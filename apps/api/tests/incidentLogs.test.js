const incidentLogModel = require('../models/incidentLogModel');

describe('Incident Logs Model Logic', () => {
  test('incidentLogModel exports required methods', () => {
    expect(typeof incidentLogModel.getAllIncidentLogs).toBe('function');
    expect(typeof incidentLogModel.getIncidentLogById).toBe('function');
    expect(typeof incidentLogModel.createIncidentLog).toBe('function');
    expect(typeof incidentLogModel.updateIncidentLog).toBe('function');
    expect(typeof incidentLogModel.deleteIncidentLog).toBe('function');
  });
});
