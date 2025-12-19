const auditModel = require('../models/auditModel');

async function logAudit({
    JobNumber = null,
    ActionType,
    ChangedBy,
    Details
}) {
    await auditModel.addAudit({
        JobNumber,
        ChangedDateTime: new Date(),
        ActionType,
        ChangedBy,
        Details
    });
}

module.exports = {
    logAudit
};