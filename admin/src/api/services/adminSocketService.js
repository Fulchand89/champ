import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const getSocketUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  // Safe production fallback (never use localhost in production)
  if (
    import.meta.env.PROD ||
    (typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1')
  ) {
    return 'https://backend-xi-nine-42.vercel.app';
  }
  // Local development fallback
  return 'http://localhost:6060';
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const initAdminSocket = () => {
  if (socket && socket.connected) return socket;

  // Vercel serverless backend does not support persistent WebSockets
  if (SOCKET_URL.includes('vercel.app')) {
    socket = {
      connected: false,
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {},
    };
    return socket;
  }

  const token =
    Cookies.get('token') ||
    localStorage.getItem('token') ||
    Cookies.get('adminToken') ||
    localStorage.getItem('adminToken');

  try {
    socket = io(SOCKET_URL, {
      auth: { token: token ? `Bearer ${token}` : '' },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 5000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to Admin WebSocket server');
      socket.emit('join_admin_room');
    });

    socket.on('connect_error', (err) => {
      // Log quietly without breaking frontend UI
      console.debug('WebSocket connection status:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.debug('WebSocket disconnected:', reason);
    });
  } catch (err) {
    console.debug('Socket initialization error:', err.message);
    socket = {
      connected: false,
      on: () => {},
      off: () => {},
      emit: () => {},
      disconnect: () => {},
    };
  }

  return socket;
};

export const getAdminSocket = () => {
  if (!socket) {
    return initAdminSocket();
  }
  return socket;
};

export const disconnectAdminSocket = () => {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    socket = null;
  }
};

export default {
  initAdminSocket,
  getAdminSocket,
  disconnectAdminSocket,
};
