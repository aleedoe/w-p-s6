import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// eslint-disable-next-line import/order
import App from "./App.tsx";

import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";

import { AuthProvider } from "./contexts/auth-context.tsx";
import { SocketProvider } from "./contexts/socket-context.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </HeroUIProvider>
  </React.StrictMode>,
);
