const supplierModel = require('../models/supplierModel');
const { logAudit } = require('../utils/auditLogger');

// Get all suppliers
async function getAllSuppliers(req, res, next) {
    try {
        const suppliers = await supplierModel.getAllSuppliers();
        res.json(suppliers);
    } catch (err) {
        next(err);
    }
}

// Get supplier by ID
async function getSupplierById(req, res, next) {
    try {
        const supplier = await supplierModel.getSupplierById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (err) {
        next(err);
    }
}

// Add new supplier
async function addSupplier(req, res, next) {
    try {
        const supplier = await supplierModel.addSupplier(req.body);
        await logAudit({
            ActionType: 'Supplier Created',
            ChangedBy: req.user.UserId,
            Details: `Supplier ${supplier.SupplierName} created`
        });
        res.status(201).json(supplier);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Supplier name already exists' });
        }
        next(err);
    }
}

// Update supplier
async function updateSupplier(req, res, next) {
    try {
        const supplier = await supplierModel.updateSupplier(req.params.id, req.body);
        await logAudit({
            ActionType: 'Supplier Updated',
            ChangedBy: req.user.UserId,
            Details: `Supplier ${supplier.SupplierName} updated`
        });
        res.json(supplier);
    } catch (err) {
        next(err);
    }
}

// Delete supplier
async function deleteSupplier(req, res, next) {
    try {
        await supplierModel.deleteSupplier(req.params.id);
        await logAudit({
            ActionType: 'Supplier Deleted',
            ChangedBy: req.user.UserId,
            Details: `Supplier ID ${req.params.id} deleted`
        });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllSuppliers,
    getSupplierById,
    addSupplier,
    updateSupplier,
    deleteSupplier
};