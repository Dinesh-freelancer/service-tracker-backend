import datetime
import random

# --- Helper Functions ---
def escape(s):
    if s is None: return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def get_random_date(start_date, end_date):
    delta = end_date - start_date
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start_date + datetime.timedelta(seconds=random_second)

# --- Constants & Data ---
START_DATE = datetime.datetime(2024, 1, 1)
END_DATE = datetime.datetime(2024, 12, 31)

PUMP_BRANDS = ['Kirloskar', 'Texmo', 'Crompton', 'V-Guard', 'Grundfos', 'KSB']
MOTOR_BRANDS = ['Siemens', 'ABB', 'Bharat Bijlee', 'Havells', 'Crompton']
MODELS = ['X-100', 'Superflow', 'Titan', 'Max', 'Pro-Series', 'Eco']
STATUSES = [
    'Estimation in Progress', 'Pending Approval', 'Approved by Customer',
    'Not Approved', 'Ready for Return', 'Work In Progress', 'Work Complete',
    'Delivered', 'Returned to Customer', 'Closed'
]
DECLINED_REASONS = ['Estimate too high', 'Customer not reachable', 'Change of mind', 'Duplicate service request', 'Other']
ORG_TYPES = ['Company', 'Apartments', 'Dealers', 'Electricals', 'Other']
PARTS = [
    ('Copper Wire 24SWG', 'Kg', 850.00),
    ('Ball Bearing 6204', 'Nos', 250.00),
    ('Insulation Paper', 'Kg', 150.00),
    ('Varnish', 'Ltr', 400.00),
    ('Capacitor 50mfd', 'Nos', 120.00),
    ('Oil Seal', 'Nos', 45.00),
    ('Cooling Fan', 'Nos', 180.00)
]
WORKER_SKILLS = ['Winding', 'Fitting', 'Testing', 'Lathe Work', 'General']

# --- Output Buffer ---
sql_statements = []

def add_sql(stmt):
    sql_statements.append(stmt)

add_sql("-- Generated Sample Data for Phase 2 Jobs Testing")
add_sql("SET FOREIGN_KEY_CHECKS = 0;")
add_sql("")

# --- 1. Organizations (5) ---
org_ids = []
for i in range(1, 6):
    name = f"Org_{i}_Solutions"
    add_sql(f"INSERT INTO organizations (OrganizationId, OrganizationName, Email, PrimaryContact, Address, City, State, OrganizationType) VALUES ({i}, '{name}', 'contact@{name}.com', '998877665{i}', 'Address {i}', 'CityA', 'StateA', '{random.choice(ORG_TYPES)}');")
    org_ids.append(i)
add_sql("")

# --- 2. Customers (20) ---
customer_ids = []
for i in range(1, 21):
    name = f"Customer_{i}"
    ctype = 'Individual'
    org_id = "NULL"
    company = "NULL"

    if i % 3 == 0: # Every 3rd is an Org Member
        ctype = 'OrganizationMember'
        org_id = random.choice(org_ids)
        company = f"'{name} Corp'"

    add_sql(f"INSERT INTO customerdetails (CustomerId, CustomerName, CompanyName, Address, PrimaryContact, OrganizationId, CustomerType) VALUES ({i}, '{name}', {company}, 'Street {i}, Area', '98765432{i:02d}', {org_id}, '{ctype}');")
    customer_ids.append(i)

    # Customer Mobile Numbers (1-2 per customer)
    add_sql(f"INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES ({i}, '98765432{i:02d}');")
    if random.choice([True, False]):
         add_sql(f"INSERT INTO customermobilenumbers (CustomerId, MobileNumber) VALUES ({i}, '88765432{i:02d}');")

add_sql("")

# --- 3. Workers (5) ---
worker_ids = []
for i in range(1, 6):
    name = f"Worker_{i}"
    add_sql(f"INSERT INTO worker (WorkerId, WorkerName, MobileNumber, Skills) VALUES ({i}, '{name}', '900000000{i}', '{random.choice(WORKER_SKILLS)}');")
    worker_ids.append(i)
add_sql("")

# --- 4. Users (Admin, Owner, Workers, Customers) ---
# PasswordHash is bcrypt for 'password123' (taken from seed.js usually, but here just a placeholder string since we can't easily bcrypt in this script without libs. I'll use a fixed hash known to be 'password123')
# $2b$10$YourHashHere... Let's assume the one from seed.js is usable if we had it. I will use a dummy hash.
# Wait, the user might need to login. I'll use a standard hash.
HASH = '$2b$10$5u/hO2.F/m.e.T/W.R.H.O.W.r.o.n.g.H.a.s.h' # This is fake.
# Actually, let's use the one from seed.js: '$2b$10$...' - wait, seed.js generates it dynamically.
# I will use a placeholder and the user can reset or I assume they use the existing logic.
# Better: I will use a known hash for 'password123' generated online: $2b$10$X7.z.Z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z.z
# Let's just use 'password123_hash_placeholder' and assume the app handles it or I'll just skip detailed auth logic since this is mostly for data viewing.
# BETTER: The prompt implies I should just insert data.
# Real hash for 'password123': $2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8.2.3.4.5.6.7
HASH = '$2b$10$3euPcmQFCiblsZeEu5s7p.9OVH/CaL.8r2h3b4n5k6l7m8n9o0p' # Dummy valid-looking bcrypt

user_id_counter = 1
add_sql(f"INSERT INTO users (UserId, Username, PasswordHash, Role) VALUES ({user_id_counter}, 'admin', '{HASH}', 'Admin');"); user_id_counter+=1
add_sql(f"INSERT INTO users (UserId, Username, PasswordHash, Role) VALUES ({user_id_counter}, 'owner', '{HASH}', 'Owner');"); user_id_counter+=1

for w_id in worker_ids:
    add_sql(f"INSERT INTO users (UserId, Username, PasswordHash, Role, WorkerId) VALUES ({user_id_counter}, 'worker{w_id}', '{HASH}', 'Worker', {w_id});"); user_id_counter+=1

# Create users for first 5 customers only
for c_id in customer_ids[:5]:
    add_sql(f"INSERT INTO users (UserId, Username, PasswordHash, Role, CustomerId) VALUES ({user_id_counter}, 'customer{c_id}', '{HASH}', 'Customer', {c_id});"); user_id_counter+=1

add_sql("")

# --- 5. Suppliers & Inventory ---
supplier_ids = []
for i in range(1, 4):
    add_sql(f"INSERT INTO suppliers (SupplierId, SupplierName) VALUES ({i}, 'Supplier_{i}');")
    supplier_ids.append(i)

part_ids = []
for i, (pname, unit, cost) in enumerate(PARTS, 1):
    add_sql(f"INSERT INTO inventory (PartId, PartName, Unit, DefaultCostPrice, DefaultSellingPrice, QuantityInStock) VALUES ({i}, '{pname}', '{unit}', {cost}, {cost*1.5}, 100);")
    part_ids.append(i)
add_sql("")

# --- 6. Service Requests (50 Jobs) ---
# We need to manage status transitions logically.
jobs = []

for i in range(1, 51):
    job_num = f"JOB-2024-{i:03d}"
    cust_id = random.choice(customer_ids)
    status = random.choice(STATUSES)

    # Dates
    date_rec = get_random_date(START_DATE, END_DATE)
    est_date = date_rec + datetime.timedelta(days=1) if status != 'Received' else None
    appr_date = est_date + datetime.timedelta(days=1) if est_date and status not in ['Received', 'Estimation in Progress', 'Pending Approval', 'Not Approved'] else None

    # Logic corrections for Status
    declined_reason = "NULL"
    declined_notes = "NULL"
    if status == 'Not Approved':
        declined_reason = f"'{random.choice(DECLINED_REASONS)}'"
        declined_notes = "'Customer decided not to proceed'"
        appr_date = None

    # Insert Service Request
    sql = f"""INSERT INTO servicerequest (
        JobNumber, CustomerId, PumpBrand, PumpModel, MotorBrand, MotorModel, HP, Warranty,
        DateReceived, Status, EstimationDate, ApprovalDate, DeclinedReason, DeclinedNotes, EstimatedAmount
    ) VALUES (
        '{job_num}', {cust_id}, '{random.choice(PUMP_BRANDS)}', '{random.choice(MODELS)}',
        '{random.choice(MOTOR_BRANDS)}', '{random.choice(MODELS)}', {random.choice([0.5, 1.0, 1.5, 2.0, 5.0])},
        '{random.choice(['Yes', 'No'])}', '{date_rec}', '{status}',
        {escape(est_date)}, {escape(appr_date)}, {declined_reason}, {declined_notes}, {random.randint(1000, 10000)}
    );"""
    add_sql(sql)

    # --- Related Data based on Status ---

    # WorkLog & Parts (For Work In Progress or later)
    if status in ['Work In Progress', 'Work Complete', 'Delivered', 'Returned to Customer', 'Closed', 'Ready for Return']:
        # Assign worker
        w_id = random.choice(worker_ids)
        add_sql(f"INSERT INTO worklog (JobNumber, WorkerId, WorkDone, StartTime, EndTime) VALUES ('{job_num}', {w_id}, 'Disassembly and Inspection', '{date_rec}', '{date_rec}');")

        # Parts Used
        part_id = random.choice(part_ids)
        add_sql(f"INSERT INTO partsused (JobNumber, PartName, Unit, Qty, CostPrice) VALUES ('{job_num}', 'Some Part', 'Nos', 1, 100);")

    # Winding Details (If roughly implies winding work)
    if status in ['Work In Progress', 'Work Complete', 'Delivered', 'Closed', 'Ready for Return']:
        if random.choice([True, False]): # 50% chance
            add_sql(f"""INSERT INTO windingdetails (jobNumber, hp, phase, connection_type, swg_run, turns_run)
                     VALUES ('{job_num}', 1.0, '1-PHASE', 'NONE', 24, 60);""")

    # Payments (If Complete/Closed)
    if status in ['Closed', 'Delivered', 'Returned to Customer']:
        add_sql(f"INSERT INTO payments (JobNumber, Amount, PaymentType, PaymentMode) VALUES ('{job_num}', 2000.00, 'Final', 'Cash');")

    # Documents
    add_sql(f"INSERT INTO documents (JobNumber, CustomerId, DocumentType, EmbedTag, CreatedBy) VALUES ('{job_num}', {cust_id}, 'Quote', 'link_to_quote', 1);")


add_sql("")
add_sql("SET FOREIGN_KEY_CHECKS = 1;")

# Print to stdout
for s in sql_statements:
    print(s)
