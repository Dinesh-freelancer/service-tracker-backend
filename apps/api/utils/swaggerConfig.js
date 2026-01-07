const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Submersible Motor Service Center API',
      version: '2.0.0',
      description: 'API documentation for the backend service managing motor service requests, inventory, assets, and customers.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://service-center-backend.onrender.com/api',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Asset: {
            type: 'object',
            properties: {
                AssetId: { type: 'integer' },
                CustomerId: { type: 'integer' },
                InternalTag: { type: 'string' },
                Brand: { type: 'string' },
                AssetType: { type: 'string', enum: ['Pumpset', 'Motor Only', 'Pump Only'] },
                PumpModel: { type: 'string' },
                MotorModel: { type: 'string' },
                SerialNumber: { type: 'string' },
                IsActive: { type: 'boolean' }
            }
        },
        ServiceRequest: {
            type: 'object',
            properties: {
                JobNumber: { type: 'string' },
                AssetId: { type: 'integer' },
                Status: { type: 'string' },
                DateReceived: { type: 'string', format: 'date-time' },
                Notes: { type: 'string' },
                InternalTag: { type: 'string', description: 'Joined from Assets' }
            }
        }
      },
      parameters: {
        HideSensitive: {
          in: 'query',
          name: 'hideSensitive',
          schema: {
            type: 'boolean',
            default: true,
          },
          description: 'Set to false to view sensitive data (Admin/Owner only)',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './apps/api/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
