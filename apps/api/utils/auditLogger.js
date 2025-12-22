const auditModel = require('../models/auditModel');

/**
 * Logs an audit event to the database.
 * @param {Object} params - The audit parameters.
 * @param {string|null} [params.JobNumber=null] - The job number associated with the event.
 * @param {string} params.ActionType - The type of action (e.g., 'Job Created').
 * @param {string|number} params.ChangedBy - The user ID or name who performed the action.
 * @param {string} params.Details - Additional details about the event.
 * @returns {Promise<void>}
 */
async function logAudit({
    JobNumber = null,
    ActionType,
    ChangedBy,
    Details
}) {
    // Call the correct method in auditModel matching signature: (actionType, changedBy, details, jobNumber)
    await auditModel.logChange(
        ActionType,
        ChangedBy,
        Details,
        JobNumber
    );
}

module.exports = {
    logAudit
};