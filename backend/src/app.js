const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// Ensure all Sequelize models and associations are registered immediately
require('./database');
const { connectDB } = require('./config/db');

const routes = require('./routes/index.routes');
const errorHandler = require('./middlewares/error.middleware');
const logger = require('./config/logger');
const env = require('./config/env');
const swaggerUi = require('swagger-ui-express');
const getSwaggerSpec = require('./config/swagger');
const { NotFoundError } = require('./shared/exceptions');
const app = express();

// Ensure DB initialization on Vercel / serverless environments
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = connectDB().catch((err) => {
      console.error('Database connection/sync warning:', err.message);
      dbInitPromise = null;
    });
  }
  try {
    await dbInitPromise;
  } catch (e) {}
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

const corsOptions = require('./config/cors');

// Robust CORS configuration
app.use(cors(corsOptions));

const loggerMiddleware = require('./middlewares/logger.middleware');

// Logging
app.use(loggerMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());


app.use('/uploads', (req, res, next) => {
  res.set('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Vary', 'Origin');

  // Handle preflight OPTIONS request immediately
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}, express.static(path.join(__dirname, 'uploads')));

// Swagger documentation (Lazy Loaded)
app.use('/api-docs', swaggerUi.serve, (req, res, next) => {
  const swaggerSpec = getSwaggerSpec();
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Quiz App API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
    },
  })(req, res, next);
});

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(getSwaggerSpec());
});




// API routes
app.use('/api/v1', routes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
})

// Handle favicon.ico requests safely
app.get('/favicon.ico', (req, res) => res.status(204).end());



// 404 handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
});


// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;
