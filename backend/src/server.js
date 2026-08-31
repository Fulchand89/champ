// 1. Load and validate environment variables first
const env = require('./config/env');
const logger = require('./config/logger');
const MESSAGES = require('./shared/constants/messages');
const { connectDB, sequelize } = require('./config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(MESSAGES.UNCAUGHT_EXCEPTION, error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error(MESSAGES.UNHANDLED_REJECTION, error);
  process.exit(1);
});

const startServer = async () => {
  try {
    logger.info('Initializing Quiz App Backend...');

    // Step 1: Connect to Database (Server will NOT start if DB connection fails)
    await connectDB();

    // Step 2: Ensure Models and Associations are loaded
    require('./database');
    logger.info('Database models and associations initialized.');

    // Step 3: Initialize Required External Services
    const { initializeFirebase } = require('./config/firebase');
    initializeFirebase();

    // Step 4: Load Express App & Routes
    const app = require('./app');

    // Step 5: Create HTTP Server & Initialize WebSockets
    const http = require('http');
    const server = http.createServer(app);

    const { initSocket } = require('./config/socket');
    initSocket(server);

    // Step 6: Server Error Handling (e.g., EADDRINUSE)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.port} is already in use by another process. Please terminate previous process or choose another port.`);
      } else {
        logger.error('Server encountered an error:', error);
      }
      process.exit(1);
    });

    // Step 7: Start Server Listening
    server.listen(env.port, '0.0.0.0', () => {
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      let localIp = 'localhost';
      
      for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            localIp = iface.address;
            break;
          }
        }
        if (localIp !== 'localhost') break;
      }

      logger.info(`${MESSAGES.SERVER_RUNNING} ${env.nodeEnv} mode on port ${env.port}`);
      logger.info(`${MESSAGES.API_AVAILABLE} Local: http://localhost:${env.port}/api/v1`);
      logger.info(`${MESSAGES.API_AVAILABLE} Network: http://${localIp}:${env.port}/api/v1`);
    });

    // Graceful Shutdown Helper
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      return new Promise((resolve) => {
        server.close(async () => {
          logger.info(MESSAGES.HTTP_CLOSED);
          try {
            await sequelize.close();
            logger.info(MESSAGES.DB_CLOSED);
          } catch (dbErr) {
            logger.error('Error closing database connection:', dbErr.message);
          }
          resolve();
        });

        // Force shutdown if taking longer than 5 seconds
        setTimeout(() => {
          logger.error(MESSAGES.SHUTDOWN_FORCE);
          resolve();
        }, 5000);
      });
    };

    process.on('SIGTERM', async () => {
      await gracefulShutdown('SIGTERM');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      await gracefulShutdown('SIGINT');
      process.exit(0);
    });

    // Support nodemon clean restarts
    process.once('SIGUSR2', async () => {
      await gracefulShutdown('SIGUSR2');
      process.kill(process.pid, 'SIGUSR2');
    });

  } catch (error) {
    logger.error(MESSAGES.SERVER_START_FAILED, error);
    process.exit(1);
  }
};

const app = require('./app');

// Only start the standalone HTTP listener in non-Vercel environments (e.g. local dev / container)
if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;