import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL || '';
const socketUrl = BASE.replace(/\/$/, '') || (typeof window !== 'undefined' ? window.location.origin : '');

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emit(event, payload) {
  const s = getSocket();
  if (s && s.connected) s.emit(event, payload);
}

export function on(event, handler) {
  const s = getSocket();
  if (s) s.on(event, handler);
  return () => s?.off(event, handler);
}

export function off(event, handler) {
  getSocket()?.off(event, handler);
}
