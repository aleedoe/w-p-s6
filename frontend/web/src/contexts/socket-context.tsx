import React from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';
import { addToast } from '@heroui/react';
import { useHistory } from 'react-router-dom';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = React.createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [connected, setConnected] = React.useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const history = useHistory();

  React.useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Initialize socket connection
    const token = localStorage.getItem('token');
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      path: '/socket.io',
      namespace: '/admin',
      auth: {
        token
      }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setConnected(false);
    });

    // Listen for events
    socketInstance.on('new_order', (data) => {
      addToast({
        title: 'New Order Received',
        description: `Order #${data.order_id} from ${data.reseller_name}`,
        color: 'primary',
        onClose: () => history.push('/admin/orders')
      });
    });

    socketInstance.on('return_status', (data) => {
      addToast({
        title: 'New Return Request',
        description: `Return request #${data.return_id} from ${data.reseller_name}`,
        color: 'warning',
        onClose: () => history.push('/admin/returns')
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, history]);

  const value = {
    socket,
    connected
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};