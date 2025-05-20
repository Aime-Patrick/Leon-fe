// src/utils/socket.ts
import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_SERVICE_URL;
let socket: Socket;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(URL, {
      autoConnect: true,
      transports: ['websocket'], // Optional: use only WebSocket
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }

  return socket;
};
