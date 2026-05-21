const organizationModel = require('../models/organizationModel');

async function getAllOrganizations(req, res, next) {
    try {
        const orgs = await organizationModel.getAllOrganizations();
        res.json(orgs);
    } catch (err) {
        next(err);
    }
}

async function createOrganization(req, res, next) {
    try {
        if (!req.body.OrganizationName) {
            return res.status(400).json({ error: 'Organization Name is required' });
        }
        const newOrg = await organizationModel.addOrganization(req.body);
        res.status(201).json(newOrg);
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getAllOrganizations,
    createOrganization
};
