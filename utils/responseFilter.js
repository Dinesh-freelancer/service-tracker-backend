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
            PumpsetBrand: job.PumpsetBrand,
            PumpsetModel: job.PumpsetModel,
            Status: job.Status,
            DateReceived: job.DateReceived,
            EstimatedAmount: job.EstimatedAmount,
            BilledAmount: job.BilledAmount,
            Notes: job.Notes,
            EstimationDate: job.EstimationDate,
            EstimateLink: job.EstimateLink
        };
    }

    // Default Masked View (Worker, Admin, Owner when sensitive=true)
    // Applies strict masking to ensure Audit Trail is triggered for raw access.
    return {
        JobNumber: job.JobNumber,
        CustomerId: STRING_HIDDEN,
        CustomerName: STRING_HIDDEN,
        PumpsetBrand: job.PumpsetBrand,
        PumpsetModel: job.PumpsetModel,
        SerialNumber: job.SerialNumber,
        HP: job.HP,
        Warranty: job.Warranty,
        DateReceived: job.DateReceived,
        Status: job.Status,
        Notes: job.Notes,
        EstimationDate: STRING_HIDDEN,
        EstimateLink: STRING_HIDDEN,
        EstimatedAmount: STRING_HIDDEN,
        BilledAmount: STRING_HIDDEN,
        WorkLogs: job.WorkLogs ? filterWorkLogList(job.WorkLogs, role, hideSensitive) : undefined,
        PartsUsed: STRING_HIDDEN,
        Payments: STRING_HIDDEN,
        WindingDetails: job.WindingDetails ? filterWindingDetailsList(job.WindingDetails, role, hideSensitive, job.Status) : undefined,
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
 * Special rule: Workers (and masked Admins) can only see details if Job Status is 'Approved By Customer' or 'Work In Progress'.
 */
function filterWindingDetails(detail, role, hideSensitive, jobStatus) {
    if (!hideSensitive) return detail;

    // Apply strict visibility for everyone when masking is enabled
    // (except maybe Customers? But customers usually don't see winding details via this API or it's not defined.
    // Assuming Customers don't use this endpoint or see limited info.
    // If Admin is masked, they get the same restrictions as Worker to ensure safety.)
    if (true) {
        const allowedStatuses = ['Approved By Customer', 'Work In Progress'];
        if (allowedStatuses.includes(jobStatus)) {
            // Worker sees technical details but maybe not sensitive notes?
            // Docs: "Response for Worker (job status Approved/In Progress only) ... returns technical fields"
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
                // Hide wire dimensions (Cost related? No, technical. But docs example shows them hidden/missing in the limited view?)
                // Docs example for Worker: id, jobNumber, hp, phase, turns_run, turns_start, slot_turns_run.
                // It does NOT show wire_id/od. Let's exclude them to match example.
                notes: detail.notes
            };
        } else {
            // If status is not allowed, return minimal or hidden
             return {
                id: detail.id,
                jobNumber: detail.jobNumber, // Keep ID/JobNumber for reference
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
        // Hide prices
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
        SubStatus: log.SubStatus,
        AssignedWorker: log.AssignedWorker,
        WorkerName: log.WorkerName
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
        Unit: part.Unit
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

    // Customer view handled by controller logic/RLS mostly, but if we need fields filtering:
    // If Customer is viewing their own payment, they probably can see the amount.
    // So if role is Customer, pass through (assuming RLS is passed).
    const { AUTH_ROLE_CUSTOMER } = require('./constants'); // Require here to avoid top-level cyclic issues if any
    if (role === AUTH_ROLE_CUSTOMER) {
        return payment;
    }

    // Default Masked View (Admin/Owner safe mode, Worker blocked at controller level anyway)
    // Mask sensitive financials.
    return {
        PaymentId: payment.PaymentId,
        JobNumber: payment.JobNumber,
        Amount: STRING_HIDDEN,
        PaymentDate: STRING_HIDDEN,
        PaymentType: STRING_HIDDEN,
        PaymentMode: STRING_HIDDEN,
        Notes: STRING_HIDDEN
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
