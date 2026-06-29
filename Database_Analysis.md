# Database Analysis

This document provides an exhaustive analysis of the database schema provided in the SQL dump, and maps its utilization across the backend (`apps/api`) and frontend (`apps/web`).

The check indicates whether a field is explicitly referenced in the codebase (API or UI components). If a field is dynamically selected (e.g. `SELECT * FROM table`) and not explicitly mentioned, it might appear as 'Unused' in code search, but still be fetched. A manual review has been conducted alongside automated searches to ensure accuracy.

## Table: `assets`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `AssetId` | ✅ | ✅ | ✅ Fully Utilized |
| `CustomerId` | ✅ | ✅ | ✅ Fully Utilized |
| `InternalTag` | ✅ | ✅ | ✅ Fully Utilized |
| `Brand` | ✅ | ✅ | ✅ Fully Utilized |
| `AssetType` | ✅ | ✅ | ✅ Fully Utilized |
| `PumpModel` | ✅ | ✅ | ✅ Fully Utilized |
| `MotorModel` | ✅ | ✅ | ✅ Fully Utilized |
| `PowerRating` | ✅ | ✅ | ✅ Fully Utilized |
| `Phase` | ✅ | ✅ | ✅ Fully Utilized |
| `SerialNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `InstallationDate` | ✅ | ✅ | ✅ Fully Utilized |
| `WarrantyExpiry` | ✅ | ✅ | ✅ Fully Utilized |
| `IsActive` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `PumpType` | ✅ | ✅ | ✅ Fully Utilized |
| `AssetDescription` | ✅ | ✅ | ✅ Fully Utilized |
| `PowerUnit` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `attendance`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `AttendanceId` | ✅ | ✅ | ✅ Fully Utilized |
| `WorkerId` | ✅ | ✅ | ✅ Fully Utilized |
| `AttendanceDate` | ✅ | ✅ | ✅ Fully Utilized |
| `Status` | ✅ | ✅ | ✅ Fully Utilized |
| `CheckInTime` | ✅ | ✅ | ✅ Fully Utilized |
| `CheckOutTime` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `auditdetails`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `AuditId` | ✅ | ❌ | ⚠️ API Only |
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `ChangedDateTime` | ✅ | ❌ | ⚠️ API Only |
| `ActionType` | ✅ | ❌ | ⚠️ API Only |
| `ChangedBy` | ✅ | ❌ | ⚠️ API Only |
| `Details` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `customerdetails`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `CustomerId` | ✅ | ✅ | ✅ Fully Utilized |
| `CustomerName` | ✅ | ✅ | ✅ Fully Utilized |
| `CompanyName` | ✅ | ✅ | ✅ Fully Utilized |
| `Address` | ✅ | ✅ | ✅ Fully Utilized |
| `City` | ✅ | ✅ | ✅ Fully Utilized |
| `State` | ✅ | ✅ | ✅ Fully Utilized |
| `Pincode` | ✅ | ✅ | ✅ Fully Utilized |
| `PrimaryContact` | ✅ | ✅ | ✅ Fully Utilized |
| `WhatsappSameAsMobile` | ❌ | ❌ | ❌ Unused |
| `Email` | ✅ | ✅ | ✅ Fully Utilized |
| `Designation` | ✅ | ✅ | ✅ Fully Utilized |
| `Notes` | ✅ | ✅ | ✅ Fully Utilized |
| `OrganizationId` | ✅ | ✅ | ✅ Fully Utilized |
| `CustomerType` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `customermobilenumbers`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `MobileId` | ✅ | ❌ | ⚠️ API Only |
| `CustomerId` | ✅ | ✅ | ✅ Fully Utilized |
| `MobileNumber` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `documents`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `DocumentId` | ✅ | ✅ | ✅ Fully Utilized |
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `AssetId` | ✅ | ✅ | ✅ Fully Utilized |
| `CustomerId` | ✅ | ✅ | ✅ Fully Utilized |
| `DocumentType` | ✅ | ✅ | ✅ Fully Utilized |
| `EmbedTag` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedBy` | ✅ | ❌ | ⚠️ API Only |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `IsCustomerVisible` | ✅ | ✅ | ✅ Fully Utilized |
| `Description` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `enquiry`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `EnquiryId` | ✅ | ✅ | ✅ Fully Utilized |
| `EnquiryDate` | ✅ | ✅ | ✅ Fully Utilized |
| `CustomerName` | ✅ | ✅ | ✅ Fully Utilized |
| `ContactNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `NatureOfQuery` | ✅ | ✅ | ✅ Fully Utilized |
| `QueryDetails` | ✅ | ✅ | ✅ Fully Utilized |
| `NextFollowUpDate` | ✅ | ✅ | ✅ Fully Utilized |
| `FollowUpNotes` | ✅ | ✅ | ✅ Fully Utilized |
| `EnteredBy` | ✅ | ❌ | ⚠️ API Only |
| `LinkedJobNumber` | ✅ | ❌ | ⚠️ API Only |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `Status` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `inventory`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `PartId` | ✅ | ✅ | ✅ Fully Utilized |
| `PartName` | ✅ | ✅ | ✅ Fully Utilized |
| `Unit` | ✅ | ✅ | ✅ Fully Utilized |
| `DefaultCostPrice` | ✅ | ✅ | ✅ Fully Utilized |
| `DefaultSellingPrice` | ✅ | ✅ | ✅ Fully Utilized |
| `Supplier` | ✅ | ✅ | ✅ Fully Utilized |
| `QuantityInStock` | ✅ | ✅ | ✅ Fully Utilized |
| `LowStockThreshold` | ✅ | ✅ | ✅ Fully Utilized |
| `Notes` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `inventory_batches`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `BatchId` | ✅ | ❌ | ⚠️ API Only |
| `PartId` | ✅ | ✅ | ✅ Fully Utilized |
| `CostPrice` | ✅ | ✅ | ✅ Fully Utilized |
| `OriginalQty` | ✅ | ❌ | ⚠️ API Only |
| `QuantityRemaining` | ✅ | ❌ | ⚠️ API Only |
| `SourceType` | ✅ | ❌ | ⚠️ API Only |
| `SourceId` | ✅ | ❌ | ⚠️ API Only |
| `ReceivedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `leads`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `LeadId` | ✅ | ❌ | ⚠️ API Only |
| `Name` | ✅ | ✅ | ✅ Fully Utilized |
| `Phone` | ✅ | ✅ | ✅ Fully Utilized |
| `PumpType` | ✅ | ✅ | ✅ Fully Utilized |
| `ApproxWeight` | ✅ | ✅ | ✅ Fully Utilized |
| `Location` | ✅ | ✅ | ✅ Fully Utilized |
| `Status` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `notifications`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `NotificationId` | ✅ | ❌ | ⚠️ API Only |
| `UserId` | ✅ | ✅ | ✅ Fully Utilized |
| `Type` | ✅ | ✅ | ✅ Fully Utilized |
| `Title` | ✅ | ✅ | ✅ Fully Utilized |
| `Message` | ✅ | ✅ | ✅ Fully Utilized |
| `ReferenceId` | ✅ | ❌ | ⚠️ API Only |
| `IsRead` | ✅ | ❌ | ⚠️ API Only |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `organizations`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `OrganizationId` | ✅ | ✅ | ✅ Fully Utilized |
| `OrganizationName` | ✅ | ✅ | ✅ Fully Utilized |
| `Email` | ✅ | ✅ | ✅ Fully Utilized |
| `PrimaryContact` | ✅ | ✅ | ✅ Fully Utilized |
| `Address` | ✅ | ✅ | ✅ Fully Utilized |
| `City` | ✅ | ✅ | ✅ Fully Utilized |
| `State` | ✅ | ✅ | ✅ Fully Utilized |
| `ZipCode` | ✅ | ✅ | ✅ Fully Utilized |
| `GSTNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `OrganizationType` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `partsused`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `PartUsedId` | ✅ | ✅ | ✅ Fully Utilized |
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `PartId` | ✅ | ✅ | ✅ Fully Utilized |
| `PartName` | ✅ | ✅ | ✅ Fully Utilized |
| `Qty` | ✅ | ✅ | ✅ Fully Utilized |
| `CostPrice` | ✅ | ✅ | ✅ Fully Utilized |
| `SellingPrice` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `payments`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `PaymentId` | ✅ | ❌ | ⚠️ API Only |
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `Amount` | ✅ | ✅ | ✅ Fully Utilized |
| `PaymentDate` | ✅ | ❌ | ⚠️ API Only |
| `PaymentType` | ✅ | ❌ | ⚠️ API Only |
| `PaymentMode` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `purchaseitems`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `PurchaseItemId` | ✅ | ✅ | ✅ Fully Utilized |
| `PurchaseId` | ✅ | ✅ | ✅ Fully Utilized |
| `PartId` | ✅ | ✅ | ✅ Fully Utilized |
| `Qty` | ✅ | ✅ | ✅ Fully Utilized |
| `UnitPrice` | ✅ | ✅ | ✅ Fully Utilized |
| `TotalPrice` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `purchases`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `PurchaseId` | ✅ | ✅ | ✅ Fully Utilized |
| `PurchaseDate` | ✅ | ✅ | ✅ Fully Utilized |
| `SupplierId` | ✅ | ✅ | ✅ Fully Utilized |
| `PurchasedBy` | ✅ | ❌ | ⚠️ API Only |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `PaymentStatus` | ✅ | ✅ | ✅ Fully Utilized |
| `Notes` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `sales_items`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `ItemId` | ✅ | ✅ | ✅ Fully Utilized |
| `Category` | ✅ | ✅ | ✅ Fully Utilized |
| `Name` | ✅ | ✅ | ✅ Fully Utilized |
| `Status` | ✅ | ✅ | ✅ Fully Utilized |
| `Specs` | ✅ | ✅ | ✅ Fully Utilized |
| `Images` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `servicerequest`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `AssetId` | ✅ | ✅ | ✅ Fully Utilized |
| `CustomerId` | ✅ | ✅ | ✅ Fully Utilized |
| `DateReceived` | ✅ | ✅ | ✅ Fully Utilized |
| `Status` | ✅ | ✅ | ✅ Fully Utilized |
| `HoldReason` | ✅ | ✅ | ✅ Fully Utilized |
| `EstimatedAmount` | ✅ | ✅ | ✅ Fully Utilized |
| `BilledAmount` | ✅ | ✅ | ✅ Fully Utilized |
| `PaymentStatus` | ✅ | ✅ | ✅ Fully Utilized |
| `ResolutionType` | ✅ | ✅ | ✅ Fully Utilized |
| `ResolutionNotes` | ✅ | ✅ | ✅ Fully Utilized |
| `Notes` | ✅ | ✅ | ✅ Fully Utilized |
| `EnquiryId` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |
| `FailureReason` | ✅ | ✅ | ✅ Fully Utilized |
| `FailureDescription` | ✅ | ✅ | ✅ Fully Utilized |
| `ServicesNeeded` | ✅ | ✅ | ✅ Fully Utilized |
| `IsWarranty` | ✅ | ✅ | ✅ Fully Utilized |
| `BillingType` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `servicerequest_history`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `HistoryId` | ✅ | ✅ | ✅ Fully Utilized |
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `StatusFrom` | ❌ | ✅ | ⚠️ Web Only |
| `StatusTo` | ✅ | ✅ | ✅ Fully Utilized |
| `ChangedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `ChangeComments` | ❌ | ✅ | ⚠️ Web Only |

---

## Table: `settings`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `SettingKey` | ✅ | ❌ | ⚠️ API Only |
| `SettingValue` | ✅ | ❌ | ⚠️ API Only |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `spare_price_search`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `id` | ✅ | ✅ | ✅ Fully Utilized |
| `pump_category` | ✅ | ❌ | ⚠️ API Only |
| `pump_type` | ✅ | ❌ | ⚠️ API Only |
| `pump_size` | ✅ | ❌ | ⚠️ API Only |
| `spare_name` | ✅ | ❌ | ⚠️ API Only |
| `basic_material` | ✅ | ❌ | ⚠️ API Only |
| `part_no` | ✅ | ❌ | ⚠️ API Only |
| `sap_material` | ✅ | ❌ | ⚠️ API Only |
| `unit_price` | ✅ | ❌ | ⚠️ API Only |
| `uom` | ✅ | ✅ | ✅ Fully Utilized |
| `last_synced_at` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `suppliers`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `SupplierId` | ✅ | ✅ | ✅ Fully Utilized |
| `SupplierName` | ✅ | ✅ | ✅ Fully Utilized |
| `ContactName` | ✅ | ✅ | ✅ Fully Utilized |
| `ContactPhone` | ✅ | ✅ | ✅ Fully Utilized |
| `ContactEmail` | ✅ | ✅ | ✅ Fully Utilized |
| `Address` | ✅ | ✅ | ✅ Fully Utilized |
| `Notes` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `users`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `UserId` | ✅ | ✅ | ✅ Fully Utilized |
| `Username` | ✅ | ✅ | ✅ Fully Utilized |
| `PasswordHash` | ✅ | ❌ | ⚠️ API Only |
| `Role` | ✅ | ✅ | ✅ Fully Utilized |
| `WorkerId` | ✅ | ✅ | ✅ Fully Utilized |
| `CustomerId` | ✅ | ✅ | ✅ Fully Utilized |
| `IsActive` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `warranty_claims`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ❌ No

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `ClaimId` | ✅ | ❌ | ⚠️ API Only |
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `OEMManufacturer` | ✅ | ✅ | ✅ Fully Utilized |
| `WarrantyStatus` | ✅ | ✅ | ✅ Fully Utilized |
| `ClaimReferenceNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `PartReplacementDetails` | ✅ | ✅ | ✅ Fully Utilized |
| `OEMCreditNoteAmount` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `windingdetails`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `id` | ✅ | ✅ | ✅ Fully Utilized |
| `AssetId` | ✅ | ✅ | ✅ Fully Utilized |
| `hp` | ✅ | ✅ | ✅ Fully Utilized |
| `kw` | ✅ | ✅ | ✅ Fully Utilized |
| `phase` | ✅ | ✅ | ✅ Fully Utilized |
| `slots` | ✅ | ✅ | ✅ Fully Utilized |
| `connection_type` | ✅ | ✅ | ✅ Fully Utilized |
| `swg_run` | ✅ | ✅ | ✅ Fully Utilized |
| `swg_start` | ✅ | ✅ | ✅ Fully Utilized |
| `swg_3phase` | ✅ | ✅ | ✅ Fully Utilized |
| `wire_id_run` | ✅ | ✅ | ✅ Fully Utilized |
| `wire_od_run` | ✅ | ✅ | ✅ Fully Utilized |
| `wire_id_start` | ✅ | ✅ | ✅ Fully Utilized |
| `wire_od_start` | ✅ | ✅ | ✅ Fully Utilized |
| `wire_id_3phase` | ✅ | ✅ | ✅ Fully Utilized |
| `wire_od_3phase` | ✅ | ✅ | ✅ Fully Utilized |
| `turns_run` | ✅ | ✅ | ✅ Fully Utilized |
| `turns_start` | ✅ | ✅ | ✅ Fully Utilized |
| `turns_3phase` | ✅ | ✅ | ✅ Fully Utilized |
| `slot_turns_run` | ✅ | ✅ | ✅ Fully Utilized |
| `slot_turns_start` | ✅ | ✅ | ✅ Fully Utilized |
| `slot_turns_3phase` | ✅ | ✅ | ✅ Fully Utilized |
| `notes` | ✅ | ✅ | ✅ Fully Utilized |
| `created_at` | ✅ | ❌ | ⚠️ API Only |
| `updated_at` | ✅ | ❌ | ⚠️ API Only |
| `weight` | ✅ | ✅ | ✅ Fully Utilized |
| `weight_run` | ✅ | ✅ | ✅ Fully Utilized |
| `weight_start` | ✅ | ✅ | ✅ Fully Utilized |

---

## Table: `worker`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `WorkerId` | ✅ | ✅ | ✅ Fully Utilized |
| `WorkerName` | ✅ | ✅ | ✅ Fully Utilized |
| `MobileNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `AlternateNumber` | ❌ | ❌ | ❌ Unused (Verified absent in code) |
| `WhatsappNumber` | ✅ | ❌ | ⚠️ API Only |
| `Address` | ✅ | ✅ | ✅ Fully Utilized |
| `DateOfJoining` | ✅ | ✅ | ✅ Fully Utilized |
| `Skills` | ✅ | ✅ | ✅ Fully Utilized |
| `IsActive` | ✅ | ✅ | ✅ Fully Utilized |
| `IsUser` | ✅ | ❌ | ⚠️ API Only |
| `Notes` | ✅ | ✅ | ✅ Fully Utilized |
| `CreatedAt` | ✅ | ✅ | ✅ Fully Utilized |
| `UpdatedAt` | ✅ | ❌ | ⚠️ API Only |

---

## Table: `worklog`

**Backend API usage:** ✅ Yes
**Frontend Web usage:** ✅ Yes

| Field | API Used | Web Used | Status |
|---|---|---|---|
| `WorkLogId` | ✅ | ✅ | ✅ Fully Utilized |
| `JobNumber` | ✅ | ✅ | ✅ Fully Utilized |
| `WorkerId` | ✅ | ✅ | ✅ Fully Utilized |
| `WorkDone` | ❌ | ❌ | ❌ Unused (Verified absent in model logic) |
| `StartTime` | ✅ | ✅ | ✅ Fully Utilized |
| `EndTime` | ✅ | ✅ | ✅ Fully Utilized |
| `WorkDate` | ❌ | ❌ | ❌ Unused (Verified absent in model logic) |

---
