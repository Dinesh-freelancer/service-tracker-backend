const path = require('path');
const dotenv = require('dotenv');

// Load .env from apps/api/ (primary) or root (fallback)
const apiEnvPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: apiEnvPath });
if (result.error) {
    const rootEnvPath = path.resolve(__dirname, '../../.env');
    dotenv.config({ path: rootEnvPath });
}

const express = require('express');
const cors = require('cors');
const app = express();
const { generalLimiter } = require('./middleware/rateLimiter');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swaggerConfig');

// Middleware
const allowedOrigins = [
    'https://rassipumps.in',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed domains or subdomains
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.rassipumps.in')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
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

const jobRoutes = require('./routes/jobs');
app.use('/api/jobs', jobRoutes);

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

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const supplierRoutes = require('./routes/supplierRoutes');
app.use('/api/suppliers', supplierRoutes);

const purchaseRoutes = require('./routes/purchases');
app.use('/api/purchases', purchaseRoutes);

const windingRoutes = require('./routes/windingDetails');
app.use('/api/winding-details', windingRoutes);

const documentRoutes = require('./routes/documents');
app.use('/api/documents', documentRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

const assetRoutes = require('./routes/assets');
app.use('/api/assets', assetRoutes);

const leadRoutes = require('./routes/leads');
app.use('/api/leads', leadRoutes);

const sparePriceRoutes = require('./routes/sparePriceRoutes');
app.use('/api/spares', sparePriceRoutes);


// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server (Only in local/dev environment)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;