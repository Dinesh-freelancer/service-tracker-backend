require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const { generalLimiter } = require('./middleware/rateLimiter');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swaggerConfig');

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all requests
app.use(generalLimiter);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'Motor Service Backend API Running!' });
});

// Routers (Add these as you build, e.g.)
const customerRoutes = require('./routes/customers');
app.use('/api/customers', customerRoutes);

const serviceRequestRoutes = require('./routes/serviceRequests');
app.use('/api/servicerequests', serviceRequestRoutes);

const workLogRoutes = require('./routes/workLogs');
app.use('/api/worklogs', workLogRoutes);

const paymentsRoutes = require('./routes/payments');
app.use('/api/payments', paymentsRoutes);


const workersRoutes = require('./routes/workers');
app.use('/api/workers', workersRoutes);

const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);

const enquiryRoutes = require('./routes/enquiries');
app.use('/api/enquiries', enquiryRoutes);

const partsUsedRoutes = require('./routes/partsUsed');
app.use('/api/partsused', partsUsedRoutes);

const inventoryRoutes = require('./routes/inventory');
app.use('/api/inventory', inventoryRoutes);

const auditRoutes = require('./routes/audit');
app.use('/api/audit', auditRoutes);


const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);

const financialReportRoutes = require('./routes/financialReports');
app.use('/api/financial-reports', financialReportRoutes);

const technicianReportRoutes = require('./routes/technicianReports');
app.use('/api/technician-reports', technicianReportRoutes);

const inventoryAlertRoutes = require('./routes/inventoryAlerts');
app.use('/api/inventory-alerts', inventoryAlertRoutes);

const summaryReportRoutes = require('./routes/summaryReports');
app.use('/api/summary-reports', summaryReportRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const supplierRoutes = require('./routes/supplierRoutes');
app.use('/api/suppliers', supplierRoutes);

const purchaseRoutes = require('./routes/purchases');
app.use('/api/purchases', purchaseRoutes);

const windingRoutes = require('./routes/windingDetails');
app.use('/api/winding-details', windingRoutes);

const documentRoutes = require('./routes/documents');
app.use('/api/documents', documentRoutes);


// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});