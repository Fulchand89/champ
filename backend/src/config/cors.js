const env = require('./env');
const logger = require('./logger');

const configuredOrigins = env.corsOrigin
  ? env.corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, Postman, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Allow wildcard
    if (configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    // Exact match in configured origins
    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Always allow localhost & loopback IP on any port
    if (
      origin.startsWith('http://localhost:') ||
      origin === 'http://localhost' ||
      origin.startsWith('https://localhost:') ||
      origin === 'https://localhost' ||
      origin.startsWith('http://127.0.0.1:') ||
      origin === 'http://127.0.0.1' ||
      origin.startsWith('https://127.0.0.1:') ||
      origin === 'https://127.0.0.1'
    ) {
      return callback(null, true);
    }

    // Allow local network IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (/^https?:\/\/(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))\.\d+\.\d+(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview and production deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    logger.warn(`[CORS] Origin blocked: ${origin}`);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'ngrok-skip-browser-warning'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

module.exports = corsOptions;
