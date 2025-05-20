// src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SERVICE_URL 
console.log('SOCKET_URL', SOCKET_URL);
type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      extraHeaders: {
        'ngrok-skip-browser-warning': '69420',
      },
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to socket.io:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from socket.io');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
