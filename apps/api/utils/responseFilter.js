const {
    AUTH_ROLE_WORKER,
    AUTH_ROLE_CUSTOMER,
    STRING_HIDDEN
} = require('./constants');

/**
 * Filters a Service Request (Job) object based on the user's role and hideSensitive flag.
 * @param {Object} job - The job object.
 * @param {string} role - The user's role.
 * @param {boolean} hideSensitive - Whether to hide sensitive info.
 * @returns {Object} - The filtered job object.
 */
function filterServiceRequest(job, role, hideSensitive) {
    if (!hideSensitive) return job;

    if (role === AUTH_ROLE_CUSTOMER) {
        // Customer view: Own jobs only.
        return {
            JobNumber: job.JobNumber,
            // Pump/Motor details now come from Asset Join
            InternalTag: job.InternalTag,
            PumpBrand: job.PumpBrand,
            PumpModel: job.PumpModel,
            MotorBrand: job.MotorBrand,
            MotorModel: job.MotorModel,
            Status: job.Status,
            DateReceived: job.DateReceived,
            EstimatedAmount: job.EstimatedAmount,
            BilledAmount: job.BilledAmount,
            Notes: job.Notes,
            // Estimation/Link might be needed if they exist
            ResolutionType: job.ResolutionType
        };
    }

    // Default Masked View (Worker, Admin, Owner when sensitive=true)
    return {
        JobNumber: job.JobNumber,
        CustomerId: STRING_HIDDEN,
        CustomerName: STRING_HIDDEN,
        // Asset Details (Public enough for workers/admins even in masked mode?)
        // Usually, tech details are fine. Customer info is sensitive.
        InternalTag: job.InternalTag,
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

        EstimatedAmount: STRING_HIDDEN,
        BilledAmount: STRING_HIDDEN,

        WorkLogs: job.WorkLogs ? filterWorkLogList(job.WorkLogs, role, hideSensitive) : undefined,
        PartsUsed: STRING_HIDDEN,
        Payments: STRING_HIDDEN,
        Documents: job.Documents ? filterDocumentList(job.Documents, role, hideSensitive) : undefined
    };
}

/**
 * Filters a Customer object.
 */
function filterCustomer(customer, role, hideSensitive) {
    if (!hideSensitive) return customer;

    // Default Masked View (Worker, Admin, Owner when sensitive=true)
    return {
        CustomerId: customer.CustomerId,
        CustomerName: STRING_HIDDEN,
        CompanyName: STRING_HIDDEN,
        WhatsappNumber: STRING_HIDDEN,
        WhatsappSameAsMobile: STRING_HIDDEN,
        Address: STRING_HIDDEN,
        CreatedAt: STRING_HIDDEN,
        UpdatedAt: STRING_HIDDEN
    };
}

/**
 * Filters Winding Details.
 */
function filterWindingDetails(detail, role, hideSensitive, jobStatus) {
    if (!hideSensitive) return detail;

    // Apply strict visibility for everyone when masking is enabled
    if (true) {
        const allowedStatuses = ['Approved By Customer', 'Work In Progress'];
        if (allowedStatuses.includes(jobStatus)) {
            return {
                id: detail.id,
                jobNumber: detail.jobNumber,
                hp: detail.hp,
                kw: detail.kw,
                phase: detail.phase,
                connection_type: detail.connection_type,
                swg_run: detail.swg_run,
                swg_start: detail.swg_start,
                swg_3phase: detail.swg_3phase,
                turns_run: detail.turns_run,
                turns_start: detail.turns_start,
                turns_3phase: detail.turns_3phase,
                slot_turns_run: detail.slot_turns_run,
                slot_turns_start: detail.slot_turns_start,
                slot_turns_3phase: detail.slot_turns_3phase,
                notes: detail.notes
            };
        } else {
             return {
                id: detail.id,
                jobNumber: detail.jobNumber,
                message: "Winding details not available at this stage"
            };
        }
    }
    return detail;
}

/**
 * Filters Inventory items.
 */
function filterInventory(item, role, hideSensitive) {
    if (!hideSensitive) return item;

    // Default Masked View
    return {
        PartId: item.PartId,
        PartName: item.PartName,
        Unit: item.Unit,
        QuantityInStock: item.QuantityInStock,
        LowStockThreshold: item.LowStockThreshold,
        SupplierId: STRING_HIDDEN
    };
}

/**
 * Filters Work Logs.
 */
function filterWorkLog(log, role, hideSensitive) {
    if (!hideSensitive) return log;

    // Default Masked View
    return {
        WorkLogId: log.WorkLogId,
        JobNumber: log.JobNumber,
        WorkDone: log.WorkDone, // Updated from SubStatus to WorkDone as per schema
        WorkerId: log.WorkerId
    };
}

/**
 * Filters Parts Used.
 */
function filterPartsUsed(part, role, hideSensitive) {
    if (!hideSensitive) return part;

    // Default Masked View
    return {
        PartUsedId: part.PartUsedId,
        JobNumber: part.JobNumber,
        PartName: part.PartName,
        Qty: part.Qty,
        // Hide prices
    };
}

/**
 * Filters Documents.
 */
function filterDocument(doc, role, hideSensitive) {
    if (!hideSensitive) return doc;

    // Default Masked View
    return {
        DocumentId: doc.DocumentId,
        JobNumber: doc.JobNumber,
        AssetId: doc.AssetId,
        DocumentType: doc.DocumentType,
        EmbedTag: STRING_HIDDEN, // Content hidden
        CreatedAt: doc.CreatedAt
    };
}

// Helper for lists
function filterList(list, filterFn, role, hideSensitive, extraArg) {
    if (!list) return [];
    if (!Array.isArray(list)) return filterFn(list, role, hideSensitive, extraArg);
    return list.map(item => filterFn(item, role, hideSensitive, extraArg));
}

function filterServiceRequestList(list, role, hideSensitive) {
    return filterList(list, filterServiceRequest, role, hideSensitive);
}

function filterWindingDetailsList(list, role, hideSensitive, jobStatus) {
    return filterList(list, filterWindingDetails, role, hideSensitive, jobStatus);
}

function filterWorkLogList(list, role, hideSensitive) {
    return filterList(list, filterWorkLog, role, hideSensitive);
}

function filterInventoryList(list, role, hideSensitive) {
    return filterList(list, filterInventory, role, hideSensitive);
}

function filterPartsUsedList(list, role, hideSensitive) {
    return filterList(list, filterPartsUsed, role, hideSensitive);
}

function filterCustomerList(list, role, hideSensitive) {
    return filterList(list, filterCustomer, role, hideSensitive);
}

function filterDocumentList(list, role, hideSensitive) {
    return filterList(list, filterDocument, role, hideSensitive);
}

/**
 * Filters Payment records.
 */
function filterPayment(payment, role, hideSensitive) {
    if (!hideSensitive) return payment;

    const { AUTH_ROLE_CUSTOMER } = require('./constants');
    if (role === AUTH_ROLE_CUSTOMER) {
        return payment;
    }

    // Default Masked View
    return {
        PaymentId: payment.PaymentId,
        JobNumber: payment.JobNumber,
        Amount: STRING_HIDDEN,
        PaymentDate: STRING_HIDDEN,
        PaymentType: STRING_HIDDEN,
        PaymentMode: STRING_HIDDEN
    };
}

function filterPaymentList(list, role, hideSensitive) {
    return filterList(list, filterPayment, role, hideSensitive);
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
