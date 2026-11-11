const salaryPaymentModel = require('../models/salaryPaymentModel');
const { logAudit } = require('../utils/auditLogger');

/**
 * Helper to format date/time strings into MySQL DATETIME ('YYYY-MM-DD HH:MM:SS').
 */
function normalizeDateTime(value) {
    if (!value) return null;
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && !value.endsWith('Z')) {
        // datetime-local format e.g. '2026-11-11T16:30' -> preserve local wall time
        const normalized = value.replace('T', ' ');
        return normalized.length === 16 ? `${normalized}:00` : normalized.slice(0, 19);
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Lists salary payments sorted by createdtime DESC, optionally filtered by workerId.
 */
async function listSalaryPayments(req, res, next) {
    try {
        const workerId = req.query.workerId ? Number(req.query.workerId) : null;
        const payments = await salaryPaymentModel.getAllSalaryPayments({ workerId });
        res.json(payments);
    } catch (err) {
        next(err);
    }
}

/**
 * Creates a new salary payment entry.
 */
async function createSalaryPayment(req, res, next) {
    try {
        const { workerId, amount, paymentType, paymentMode, notes, createdtime } = req.body;

        if (!workerId) {
            return res.status(400).json({ error: 'Worker is required' });
        }
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Valid positive amount is required' });
        }

        const payload = {
            workerId: Number(workerId),
            amount: parsedAmount,
            paymentType: paymentType || 'Salary',
            paymentMode: paymentMode || 'Cash',
            notes: notes || null,
            createdtime: normalizeDateTime(createdtime)
        };

        const created = await salaryPaymentModel.createSalaryPayment(payload);

        await logAudit({
            ActionType: 'Salary Payment Created',
            ChangedBy: req.user?.UserId,
            Details: `Created ${payload.paymentType} payment of ₹${parsedAmount} for worker ID ${payload.workerId}`
        });

        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
}

/**
 * Updates an existing salary payment entry.
 */
async function updateSalaryPayment(req, res, next) {
    try {
        const id = Number(req.params.id);
        const existing = await salaryPaymentModel.getSalaryPaymentById(id);
        if (!existing) {
            return res.status(404).json({ error: 'Salary payment not found' });
        }

        const updatePayload = {};
        if (req.body.workerId !== undefined) updatePayload.workerId = Number(req.body.workerId);
        if (req.body.amount !== undefined) {
            const parsedAmount = Number(req.body.amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                return res.status(400).json({ error: 'Valid positive amount is required' });
            }
            updatePayload.amount = parsedAmount;
        }
        if (req.body.paymentType !== undefined) updatePayload.paymentType = req.body.paymentType;
        if (req.body.paymentMode !== undefined) updatePayload.paymentMode = req.body.paymentMode;
        if (req.body.notes !== undefined) updatePayload.notes = req.body.notes;
        if (req.body.createdtime !== undefined) {
            const formatted = normalizeDateTime(req.body.createdtime);
            if (formatted) updatePayload.createdtime = formatted;
        }

        const updated = await salaryPaymentModel.updateSalaryPayment(id, updatePayload);

        await logAudit({
            ActionType: 'Salary Payment Updated',
            ChangedBy: req.user?.UserId,
            Details: `Updated salary payment ID ${id}`
        });

        res.json(updated);
    } catch (err) {
        next(err);
    }
}

/**
 * Deletes a salary payment entry.
 */
async function deleteSalaryPayment(req, res, next) {
    try {
        const id = Number(req.params.id);
        const existing = await salaryPaymentModel.getSalaryPaymentById(id);
        if (!existing) {
            return res.status(404).json({ error: 'Salary payment not found' });
        }

        await salaryPaymentModel.deleteSalaryPayment(id);

        await logAudit({
            ActionType: 'Salary Payment Deleted',
            ChangedBy: req.user?.UserId,
            Details: `Deleted salary payment ID ${id} (Worker ID ${existing.workerId}, Amount ₹${existing.amount})`
        });

        res.json({ message: 'Salary payment deleted successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listSalaryPayments,
    createSalaryPayment,
    updateSalaryPayment,
    deleteSalaryPayment
};
