const {
    AUTH_ROLE_ADMIN,
    AUTH_ROLE_OWNER,
    AUTH_ROLE_WORKER,
    AUTH_ROLE_CUSTOMER,
    STRING_HIDDEN
} = require('./constants');

/**
 * Filters a Service Request (Job) object based on the user's role.
 * Role-Based Access Control (RBAC) implementation:
 * - Owner: Full Access.
 * - Admin: Operational Access (Customer Info, Bill Amounts). No Cost Prices.
 * - Worker: Technical Access. No Financials.
 * - Customer: Own Job Access.
 */
function filterServiceRequest(job, role) {
    // 1. Customer View
    if (role === AUTH_ROLE_CUSTOMER) {
        return {
            JobNumber: job.JobNumber,
            AssetId: job.AssetId,
            InternalTag: job.InternalTag,
            Phase: job.Phase,
            PumpBrand: job.PumpBrand,
            PumpModel: job.PumpModel,
            MotorBrand: job.MotorBrand,
            MotorModel: job.MotorModel,
            Status: job.Status,
            DateReceived: job.DateReceived,
            EstimatedAmount: job.EstimatedAmount,
            BilledAmount: job.BilledAmount,
            Notes: job.Notes,
            ResolutionType: job.ResolutionType,
            Documents: job.Documents ? filterDocumentList(job.Documents, role) : undefined
        };
    }

    // 2. Base Object (Common to Staff)
    const filtered = {
        JobNumber: job.JobNumber,
        CustomerId: job.CustomerId,
        AssetId: job.AssetId,
        // Worker must not see Customer Name or Details
        CustomerName: (role === AUTH_ROLE_WORKER) ? STRING_HIDDEN : job.CustomerName,
        PrimaryContact: (role === AUTH_ROLE_WORKER) ? STRING_HIDDEN : job.PrimaryContact,
        OrganizationName: (role === AUTH_ROLE_WORKER) ? STRING_HIDDEN : job.OrganizationName,
        CustomerType: job.CustomerType,
        InternalTag: job.InternalTag,
        Phase: job.Phase,
        Brand: job.Brand,
        AssetType: job.AssetType,
        PumpModel: job.PumpModel,
        MotorModel: job.MotorModel,
        SerialNumber: job.SerialNumber,
        HP: job.HP,
        WarrantyExpiry: job.WarrantyExpiry,
        DateReceived: job.DateReceived,
        Status: job.Status,
        Notes: job.Notes,
        ResolutionType: job.ResolutionType,
        History: job.History, // Audit Trail visible to Staff
        WorkLogs: job.WorkLogs ? filterWorkLogList(job.WorkLogs, role) : undefined,
        Documents: job.Documents ? filterDocumentList(job.Documents, role) : undefined,
        // Parts & Payments depend on Role
    };

    // 3. Financial Visibility
    const canSeeFinancials = (role === AUTH_ROLE_OWNER || role === AUTH_ROLE_ADMIN);
    const canSeeProfits = (role === AUTH_ROLE_OWNER);

    if (canSeeFinancials) {
        filtered.EstimatedAmount = job.EstimatedAmount;
        filtered.BilledAmount = job.BilledAmount;
        filtered.Payments = job.Payments ? filterPaymentList(job.Payments, role) : undefined;
    } else {
        filtered.EstimatedAmount = STRING_HIDDEN;
        filtered.BilledAmount = STRING_HIDDEN;
        filtered.Payments = STRING_HIDDEN;
    }

    // 4. Parts Used (Admin sees List/Price but NOT Cost. Worker sees List but NOT Price/Cost? Or maybe Worker sees nothing?)
    // Worker needs to see parts to know what was used.
    filtered.Parts = job.Parts ? filterPartsUsedList(job.Parts, role) : undefined;
    // Note: filterPartsUsedList handles masking Cost/Price inside.

    return filtered;
}

/**
 * Filters a Customer object.
 */
function filterCustomer(customer, role) {
    const isOwnerOrAdmin = [AUTH_ROLE_OWNER, AUTH_ROLE_ADMIN].includes(role);

    if (isOwnerOrAdmin) {
        return customer; // Admin/Owner see full details
    }

    if (role === AUTH_ROLE_WORKER) {
        // Workers see nothing about the customer
        return {
            CustomerId: customer.CustomerId,
            CustomerName: STRING_HIDDEN,
            CompanyName: STRING_HIDDEN,
            Address: STRING_HIDDEN,
            City: STRING_HIDDEN,
            State: STRING_HIDDEN,
            Pincode: STRING_HIDDEN,
            PrimaryContact: STRING_HIDDEN,
            Email: STRING_HIDDEN,
            WhatsappNumber: STRING_HIDDEN
        };
    }

    // Fallback (shouldn't happen for Customers fetching others)
    return {
        CustomerId: customer.CustomerId,
        CustomerName: STRING_HIDDEN
    };
}

/**
 * Filters Winding Details.
 */
function filterWindingDetails(detail, role, jobStatus) {
    // Workers only see if Approved/WIP
    if (role === AUTH_ROLE_WORKER) {
        const allowedStatuses = ['Approved By Customer', 'Work In Progress'];
        if (!allowedStatuses.includes(jobStatus)) {
             return {
                id: detail.id,
                assetId: detail.assetId,
                message: "Winding details not available at this stage"
            };
        }
    }
    return detail;
}

/**
 * Filters Inventory items.
 */
function filterInventory(item, role) {
    const canSeeCost = (role === AUTH_ROLE_OWNER);

    const filtered = {
        PartId: item.PartId,
        PartName: item.PartName,
        Unit: item.Unit,
        QuantityInStock: item.QuantityInStock,
        LowStockThreshold: item.LowStockThreshold,
        // Supplier visible to Admin? Maybe.
        Supplier: item.Supplier,
        DefaultSellingPrice: item.DefaultSellingPrice
    };

    if (canSeeCost) {
        filtered.DefaultCostPrice = item.DefaultCostPrice;
    }

    return filtered;
}

/**
 * Filters Work Logs.
 */
function filterWorkLog(log, role) {
    return log; // Visible to all staff
}

/**
 * Filters Parts Used.
 */
function filterPartsUsed(part, role) {
    const canSeeCost = (role === AUTH_ROLE_OWNER);
    const canSeePrice = (role === AUTH_ROLE_OWNER || role === AUTH_ROLE_ADMIN);

    const filtered = {
        PartUsedId: part.PartUsedId,
        JobNumber: part.JobNumber,
        PartName: part.PartName,
        Qty: part.Qty
    };

    if (canSeePrice) {
        filtered.SellingPrice = part.SellingPrice;
    }

    if (canSeeCost) {
        filtered.CostPrice = part.CostPrice;
    }

    return filtered;
}

/**
 * Filters Documents.
 */
function filterDocument(doc, role) {
    return doc; // Visible
}

/**
 * Filters Payment records.
 */
function filterPayment(payment, role) {
    // Admin/Owner see payments
    const canSee = (role === AUTH_ROLE_OWNER || role === AUTH_ROLE_ADMIN || role === AUTH_ROLE_CUSTOMER);

    if (canSee) {
        return payment;
    }

    return {
        PaymentId: payment.PaymentId,
        Amount: STRING_HIDDEN
    };
}

// Helpers
function filterList(list, filterFn, role, extraArg) {
    if (!list) return [];
    if (!Array.isArray(list)) return filterFn(list, role, extraArg);
    return list.map(item => filterFn(item, role, extraArg));
}

function filterServiceRequestList(list, role) {
    return filterList(list, filterServiceRequest, role);
}

function filterWindingDetailsList(list, role, jobStatus) {
    return filterList(list, filterWindingDetails, role, jobStatus);
}

function filterWorkLogList(list, role) {
    return filterList(list, filterWorkLog, role);
}

function filterInventoryList(list, role) {
    return filterList(list, filterInventory, role);
}

function filterPartsUsedList(list, role) {
    return filterList(list, filterPartsUsed, role);
}

function filterCustomerList(list, role) {
    return filterList(list, filterCustomer, role);
}

function filterDocumentList(list, role) {
    return filterList(list, filterDocument, role);
}

function filterPaymentList(list, role) {
    return filterList(list, filterPayment, role);
}

module.exports = {
    filterServiceRequest,
    filterServiceRequestList,
    filterCustomer,
    filterCustomerList,
    filterWindingDetails,
    filterWindingDetailsList,
    filterInventory,
    filterInventoryList,
    filterWorkLog,
    filterWorkLogList,
    filterPartsUsed,
    filterPartsUsedList,
    filterDocumentList,
    filterPayment,
    filterPaymentList
};
