const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management System API',
      version: '1.0.0',
      description: 'A comprehensive library management system built with Node.js, Express, and MySQL',
      contact: {
        name: 'Library Management Team',
        email: 'admin@library.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3030/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../../../docs/api-documentation.js')
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
