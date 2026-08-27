module.exports = {
  // Success messages
  SUCCESS: 'Success',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  
  // Error messages
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  BAD_REQUEST: 'Bad Request',
  DUPLICATE_ENTRY: 'Duplicate entry',
  ALREADY_EXISTS: 'already exists',
  
  // Auth messages
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_REQUIRED: 'Token is required',
  TOKEN_INVALID: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  FORBIDDEN: 'Access denied. Insufficient permissions.',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'User with this email already exists',
  MOBILE_ALREADY_EXISTS: 'User with this mobile number already exists',
  ADHAR_ALREADY_EXISTS: 'User with this Aadhar number already exists',
  ACCOUNT_INACTIVE: 'User account is inactive. Please contact support.',
  OTP_SENT: 'OTP has been sent to your email address',
  OTP_INVALID: 'Invalid or expired OTP',
  OTP_VERIFIED: 'OTP verified successfully',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully',
  PROFILE_DELETE_SUCCESS: 'Profile deleted successfully',
  PROFILE_PIC_DELETE_SUCCESS: 'Profile picture deleted successfully',
  PROFILE_PIC_NOT_FOUND: 'No profile picture found to delete',
  EMAIL_CHANGE_OTP_SENT: 'OTP for email change has been sent to your new email',
  EMAIL_CHANGE_SUCCESS: 'Email changed successfully',
  NO_PENDING_EMAIL: 'No pending email change request found',



  // Server messages
  UNCAUGHT_EXCEPTION: 'Uncaught Exception:',
  UNHANDLED_REJECTION: 'Unhandled Rejection:',
  SERVER_RUNNING: 'Server running in',
  API_AVAILABLE: 'API available at',
  SHUTDOWN_SIGNAL: 'Received shutdown signal, closing server...',
  HTTP_CLOSED: 'HTTP server closed',
  DB_CLOSED: 'Database connection closed',
  SHUTDOWN_FORCE: 'Could not close connections in time, forcefully shutting down',
  SERVER_START_FAILED: 'Failed to start server:',
  
  // Database messages
  DB_CONNECTED: 'MySQL Database connected successfully',
  DB_SYNCED: 'Database synced',
  DB_CONNECTION_FAILED: 'Unable to connect to database:',
  
  // Socket messages
  SOCKET_ALREADY_INIT: 'Socket.io server already initialized!',
  SOCKET_INIT_ORIGINS: 'Initializing Socket.io server with origins:',
  SOCKET_AUTH_SUCCESS: '[Socket Auth] User authenticated:',
  SOCKET_AUTH_INVALID: '[Socket Auth] Invalid user or inactive account for connection ID:',
  SOCKET_AUTH_ERROR: '[Socket Auth Middleware Error]:',
  SOCKET_CONNECTED: '[Socket Connection] Client connected:',
  SOCKET_ROOM_JOINED: '[Socket Room] User',
  SOCKET_ADMIN_ROOM_JOINED: '[Socket Room] Admin',
  SOCKET_CLIENT_EVENT_ROOM: '[Socket Room] Client',
  SOCKET_EVENT_JOIN_SUCCESS: 'Successfully joined room',
  SOCKET_EVENT_LEAVE_SUCCESS: 'Successfully left room',
  SOCKET_DISCONNECTED: '[Socket Disconnect] Client disconnected:',
  SOCKET_NOT_INIT: 'Socket.io has not been initialized! Please call initSocket(server) first.',
  SOCKET_BROADCAST: '[Socket Broadcast] Event',
  SOCKET_BROADCAST_ERROR: '[Socket Broadcast Error] Failed to emit',
};