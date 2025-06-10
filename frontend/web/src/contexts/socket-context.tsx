import React from "react";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { addToast } from "@heroui/toast";

import { useAuth } from "./auth-context";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = React.createContext<SocketContextType | undefined>(
  undefined,
);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [connected, setConnected] = React.useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }

      return;
    }

    const token = localStorage.getItem("token");

    const socketInstance = io(
      (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/admin",
      {
        path: "/socket.io",
        auth: { token },
      },
    );

    socketInstance.on("connect", () => {
      // eslint-disable-next-line no-console
      console.log("Socket connected");
      setConnected(true);
    });

    socketInstance.on("disconnect", () => {
      // eslint-disable-next-line no-console
      console.log("Socket disconnected");
      setConnected(false);
    });

    socketInstance.on("connect_error", (err: any) => {
      // eslint-disable-next-line no-console
      console.error("Socket connection error:", err);
      setConnected(false);
    });

    socketInstance.on(
      "new_order",
      (data: { order_id: any; reseller_name: any }) => {
        addToast({
          title: "New Order Received",
          description: `Order #${data.order_id} from ${data.reseller_name}`,
          color: "primary",
          onClose: () => navigate("/admin/orders"),
        });
      },
    );

    socketInstance.on(
      "return_status",
      (data: { return_id: any; reseller_name: any }) => {
        addToast({
          title: "New Return Request",
          description: `Return request #${data.return_id} from ${data.reseller_name}`,
          color: "warning",
          onClose: () => navigate("/admin/returns"),
        });
      },
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, navigate]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);

  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
