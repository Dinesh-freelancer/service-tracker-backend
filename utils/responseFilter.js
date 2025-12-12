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

    if (role === AUTH_ROLE_WORKER) {
        // Worker view: No customer info (except name if needed? Docs say "CustomerName: Hidden"), no costs.
        // Needs: JobNumber, Motor details, Status, DateReceived (maybe), Notes (operational).
        return {
            JobNumber: job.JobNumber,
            CustomerName: STRING_HIDDEN, // Explicitly hidden per docs
            MotorBrand: job.MotorBrand,
            MotorModel: job.MotorModel,
            MotorSerialNo: job.MotorSerialNo,
            HP: job.HP,
            KW: job.KW,
            Phase: job.Phase,
            Poles: job.Poles,
            DateReceived: job.DateReceived,
            Status: job.Status,
            Notes: job.Notes, // Workers might need notes? Docs say "Response for Worker ... no times/notes" for WorkLogs, but for Jobs: "Notes: Motor bearing replacement required" is shown in Admin view. Worker view example shows limited fields. Let's keep Notes visible if it's technical. Docs example for Worker doesn't show Notes. Let's be safe and hide if unsure, but usually workers need notes.
            // Re-reading docs: Worker view example for GET /jobs/:id shows "MotorBrand", "HP", "Status", "WorkLogs" (limited), "PartsUsed": "Hidden".
            // It does NOT show Notes in the Worker example.
            EstimatedAmount: STRING_HIDDEN,
            BilledAmount: STRING_HIDDEN,
            WorkLogs: job.WorkLogs ? filterWorkLogList(job.WorkLogs, role, hideSensitive) : undefined,
            PartsUsed: STRING_HIDDEN, // Docs example says "PartsUsed": "Hidden"
            Payments: STRING_HIDDEN,
            WindingDetails: job.WindingDetails ? filterWindingDetailsList(job.WindingDetails, role, hideSensitive, job.Status) : undefined,
            Documents: job.Documents ? filterDocumentList(job.Documents, role, hideSensitive) : undefined
        };
    } else if (role === AUTH_ROLE_CUSTOMER) {
        // Customer view: Own jobs only.
        return {
            JobNumber: job.JobNumber,
            MotorBrand: job.MotorBrand,
            MotorModel: job.MotorModel,
            Status: job.Status,
            DateReceived: job.DateReceived,
            EstimatedAmount: job.EstimatedAmount, // Customer sees estimates
            BilledAmount: job.BilledAmount, // Customer sees bill
            // Hide internal technical details or specific worker notes if necessary
            Notes: job.Notes // Customer probably sees notes related to the job status
        };
    }

    // Default fallback for other roles if hideSensitive is somehow true
    return job;
}

/**
 * Filters a Customer object.
 */
function filterCustomer(customer, role, hideSensitive) {
    if (!hideSensitive) return customer;

    if (role === AUTH_ROLE_WORKER) {
        // Worker view: Hidden
        return {
            CustomerId: customer.CustomerId,
            CustomerName: STRING_HIDDEN,
            CompanyName: STRING_HIDDEN,
            Phone1: STRING_HIDDEN,
            Email: STRING_HIDDEN,
            Address: STRING_HIDDEN,
            City: STRING_HIDDEN
        };
    }
    return customer;
}

/**
 * Filters Winding Details.
 * Special rule: Workers can only see details if Job Status is 'Approved By Customer' or 'Work In Progress'.
 */
function filterWindingDetails(detail, role, hideSensitive, jobStatus) {
    if (!hideSensitive) return detail;

    if (role === AUTH_ROLE_WORKER) {
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

    if (role === AUTH_ROLE_WORKER) {
        // Worker: No costs.
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
    return item;
}

/**
 * Filters Work Logs.
 */
function filterWorkLog(log, role, hideSensitive) {
    if (!hideSensitive) return log;

    if (role === AUTH_ROLE_WORKER) {
        // Worker: Limited fields. No times/notes?
        // Docs: "Response for Worker ... SubStatus, AssignedWorker, WorkerName".
        return {
            WorkLogId: log.WorkLogId,
            JobNumber: log.JobNumber,
            SubStatus: log.SubStatus,
            AssignedWorker: log.AssignedWorker,
            WorkerName: log.WorkerName
        };
    }
    return log;
}

/**
 * Filters Parts Used.
 */
function filterPartsUsed(part, role, hideSensitive) {
    if (!hideSensitive) return part;

    if (role === AUTH_ROLE_WORKER) {
        // Worker: No costs.
        return {
            PartUsedId: part.PartUsedId,
            JobNumber: part.JobNumber,
            PartName: part.PartName,
            Qty: part.Qty,
            Unit: part.Unit
        };
    }
    return part;
}

/**
 * Filters Documents.
 */
function filterDocument(doc, role, hideSensitive) {
    if (!hideSensitive) return doc;

    if (role === AUTH_ROLE_WORKER) {
        // Workers generally don't need to see financial documents (Quotes/Invoices).
        // Maybe Photos?
        // Current implementation was hiding everything.
        // Let's hide EmbedTag (content) but show type? Or just hide everything?
        // Safe bet: Hide content.
         return {
            DocumentId: doc.DocumentId,
            JobNumber: doc.JobNumber,
            DocumentType: doc.DocumentType, // Maybe they can see type
            EmbedTag: STRING_HIDDEN, // Content hidden
            CreatedAt: doc.CreatedAt
        };
    }
    return doc;
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
    filterDocumentList
};
