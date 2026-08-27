const { Server } = require('socket.io');
const { verifyToken } = require('../shared/utils/jwt');
const env = require('./env');
const logger = require('./logger');
const corsOptions = require('./cors');
const MESSAGES = require('../shared/constants/messages');

let io = null;

/**
 * Initialize Socket.io Server
 * @param {import('http').Server} server - Node HTTP server instance
 */
const initSocket = (server) => {
  if (io) {
    logger.warn(MESSAGES.SOCKET_ALREADY_INIT);
    return io;
  }

  // Parse CORS origins
  const allowedOrigins = env.corsOrigin
    ? env.corsOrigin.split(',').map((origin) => origin.trim())
    : [];

  logger.info(MESSAGES.SOCKET_INIT_ORIGINS, allowedOrigins);

  io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60000, // 60s ping timeout
    pingInterval: 25000, // 25s ping interval
  });

  // Hybrid Authentication Middleware
  io.use(async (socket, next) => {
    try {
      // Get token from auth object or headers
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
      }

      if (!token) {
        // Allow anonymous connection
        socket.user = null;
        socket.userId = null;
        return next();
      }

      // Verify token
      const decoded = verifyToken(token);
      
      // Delay model import to prevent circular dependency
      const { User } = require('../database');
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (user && user.isActive) {
        socket.user = user;
        socket.userId = user.id;
        logger.info(`${MESSAGES.SOCKET_AUTH_SUCCESS} ${user.email} (ID: ${user.id})`);
      } else {
        logger.warn(`${MESSAGES.SOCKET_AUTH_INVALID} ${socket.id}`);
        socket.user = null;
        socket.userId = null;
      }
      
      next();
    } catch (error) {
      logger.error(MESSAGES.SOCKET_AUTH_ERROR, error.message);
      // We don't reject the connection, we just treat them as guest/anonymous
      socket.user = null;
      socket.userId = null;
      next();
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    logger.info(`${MESSAGES.SOCKET_CONNECTED} ${socket.id} (User ID: ${socket.userId || 'Anonymous'})`);

    // 1. Auto-join user-specific private room if authenticated
    if (socket.userId) {
      const userRoom = `user_${socket.userId}`;
      socket.join(userRoom);
      logger.info(`${MESSAGES.SOCKET_ROOM_JOINED} ${socket.userId} joined private room: ${userRoom}`);

      // Broadcast online status (only if this is their first active connection)
      const connectionCount = io.sockets.adapter.rooms.get(userRoom)?.size || 1;
      if (connectionCount === 1) {
        io.emit('user_status', { userId: socket.userId, status: 'online' });
      }

      // Auto-join admins room if user is an admin
      const userRole = String(socket.user.role || '').toLowerCase();
      if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'superadmin') {
        socket.join('admins');
        logger.info(`${MESSAGES.SOCKET_ADMIN_ROOM_JOINED} ${socket.userId} joined 'admins' room`);
      }
    }


    // 2.5 Handle joining/leaving enquiry rooms (for Chat)
    socket.on('join_enquiry', ({ enquiryId }) => {
      if (!enquiryId) return;
      const enquiryRoom = `enquiry_${enquiryId}`;
      socket.join(enquiryRoom);
      logger.info(`Socket ${socket.id} joined enquiry room: ${enquiryRoom}`);
    });

    socket.on('leave_enquiry', ({ enquiryId }) => {
      if (!enquiryId) return;
      const enquiryRoom = `enquiry_${enquiryId}`;
      socket.leave(enquiryRoom);
      logger.info(`Socket ${socket.id} left enquiry room: ${enquiryRoom}`);
    });

    // 3. Heartbeat / ping-pong for connectivity checks
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // 3.5 Check User Status (Online/Offline)
    socket.on('check_user_status', ({ userId }, callback) => {
      if (!userId || typeof callback !== 'function') return;
      const userRoom = `user_${userId}`;
      const isOnline = io.sockets.adapter.rooms.has(userRoom);
      callback({ userId, status: isOnline ? 'online' : 'offline' });
    });

    // 4. Handle Disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`${MESSAGES.SOCKET_DISCONNECTED} ${socket.id} (Reason: ${reason})`);
      if (socket.userId) {
        const userRoom = `user_${socket.userId}`;
        // Because disconnect already fired, this socket has left its rooms.
        const isStillOnline = io.sockets.adapter.rooms.has(userRoom);
        if (!isStillOnline) {
          io.emit('user_status', { userId: socket.userId, status: 'offline', lastSeen: new Date().toISOString() });
        }
      }
    });
  });

  return io;
};

/**
 * Get active Socket.io instance
 * @returns {import('socket.io').Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error(MESSAGES.SOCKET_NOT_INIT);
  }
  return io;
};

/**
 * Emit an event to a specific room
 * @param {string} room - Room name to emit to
 * @param {string} event - Event name
 * @param {any} data - Payload data
 */
const emitToRoom = (room, event, data) => {
  try {
    const activeIo = getIO();
    activeIo.to(room).emit(event, data);
    logger.info(`${MESSAGES.SOCKET_BROADCAST} '${event}' sent to room '${room}'`);
    return true;
  } catch (error) {
    logger.error(`${MESSAGES.SOCKET_BROADCAST_ERROR} '${event}' to room '${room}':`, error.message);
    return false;
  }
};

/**
 * Helper to emit event strictly to a specific event code's room
 * @param {string|number} eventCode - The event code
 * @param {string} event - Event name
 * @param {any} data - Payload data
 */
const emitToEventRoom = (eventCode, event, data) => {
  if (!eventCode) return false;
  const room = `event_${eventCode}`;
  return emitToRoom(room, event, data);
};

module.exports = {
  initSocket,
  getIO,
  emitToRoom,
  emitToEventRoom,
};
