const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Submersible Motor Service Center API',
      version: '1.0.0',
      description: 'API documentation for the backend service managing motor service requests, inventory, and customers.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
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
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
