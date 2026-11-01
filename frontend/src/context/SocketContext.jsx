import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);
  const [liveNotification, setLiveNotification] = useState(null);

  useEffect(() => {
    const socketServerUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketServerUrl, {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to DineEasy Socket server:', newSocket.id);

      // Join appropriate room
      if (user) {
        if (user.role === 'restaurant_owner' && user.restaurantId) {
          const restId = typeof user.restaurantId === 'object' ? user.restaurantId._id || user.restaurantId.id : user.restaurantId;
          newSocket.emit('join_restaurant', restId);
        } else if (user.role === 'admin') {
          newSocket.emit('join_admin');
        } else if (user.role === 'customer') {
          newSocket.emit('join_user', user.id || user._id);
        }
      }
    });

    // Listen for live new reservation notifications (for restaurant owner)
    newSocket.on('new_reservation', (data) => {
      setLiveNotification({
        type: 'new_reservation',
        title: '🔔 New Reservation Received!',
        message: data.notification?.message || `New table booking ${data.reservation?.bookingId} received!`,
        reservation: data.reservation,
        timestamp: new Date(),
      });
    });

    // Listen for status updates (for customer)
    newSocket.on('reservation_status_changed', (data) => {
      setLiveNotification({
        type: 'status_changed',
        title: data.notification?.title || 'Reservation Status Update',
        message: data.notification?.message || `Your booking status has changed.`,
        reservation: data.reservation,
        timestamp: new Date(),
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const clearLiveNotification = () => setLiveNotification(null);

  return (
    <SocketContext.Provider value={{ socket, liveNotification, clearLiveNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

