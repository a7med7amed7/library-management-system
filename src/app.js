const express = require("express");
const { errorHandler, notFound } = require("./shared/middleware/errorHandler.js");
const { specs, swaggerUi } = require("./shared/config/swagger.js");

// Enable CORS for Swagger UI
const cors = require('cors');

const bookRoutes = require("./modules/books/routes/bookRoutes.js");
const borrowingRoutes = require('./modules/borrowing/routes/borrowingRoutes');
const authenticationRoutes = require('./modules/auth/routes/authRoutes.js');
const borrowerRoutes = require('./modules/borrowers/routes/borrowerRoutes.js');
const reportingRoutes = require('./modules/reporting/routes/reportingRoutes');

const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Library Management API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Library Management API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint for swagger specs
app.get('/api-docs/json', (req, res) => {
  res.json(specs);
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .btn.authorize { background-color: #4CAF50; color: white; }
    .swagger-ui .btn.authorize:hover { background-color: #45a049; }
    .swagger-ui .btn.execute { background-color: #2196F3; color: white; }
    .swagger-ui .btn.execute:hover { background-color: #1976D2; }
  `,
  customSiteTitle: "Library Management API Documentation"
}));

// API routes
app.use('/api/auth', authenticationRoutes);
app.use("/api/books", bookRoutes);
app.use('/api/borrowing', borrowingRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/reports', reportingRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
