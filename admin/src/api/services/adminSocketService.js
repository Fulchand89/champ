import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:6060';

let socket = null;

export const initAdminSocket = () => {
  if (socket && socket.connected) return socket;

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
      reconnectionAttempts: 5,
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
