const admin = require('firebase-admin');
const path = require('path');
const logger = require('./logger');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    const serviceAccountPath = path.resolve(__dirname, 'quizapp-firebase-adminsdk.json');
    
    admin.initializeApp({
      credential: admin.cert(require(serviceAccountPath)),
    });
    
    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    // Don't throw error to allow app to start even if firebase fails initially due to dummy file
    console.warn('Firebase Admin is using a dummy or missing config. Push notifications will fail.');
  }
};

const { getMessaging } = require('firebase-admin/messaging');
const { getAuth } = require('firebase-admin/auth');

const sendPushNotification = async (tokens, title, body, data = {}) => {
  try {
    if (!tokens || tokens.length === 0) return;

    const message = {
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK', 
      },
      tokens: Array.isArray(tokens) ? tokens : [tokens],
    };

    const response = await getMessaging().sendEachForMulticast(message);
    
    // Cleanup invalid tokens based on response could be handled here
    logger.info(`Successfully sent ${response.successCount} messages; Failed ${response.failureCount} messages.`);
    return response;
  } catch (error) {
    logger.error('Error sending push notification:', error);
    throw error;
  }
};

module.exports = {
  admin,
  getAuth,
  initializeFirebase,
  sendPushNotification,
};

