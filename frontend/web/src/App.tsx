import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./contexts/auth-context";
import LoginPage from "./pages/login";
import DashboardLayout from "./layouts/dashboard-layout";
import Dashboard from "./pages/dashboard";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <DashboardLayout>{children}</DashboardLayout>
  ) : (
    <Navigate replace to="/login" />
  );
};

function App() {
  return (
    <Routes>
      {/* Halaman Login */}
      <Route element={<LoginPage />} path="/login" />

      {/* Dashboard dibungkus PrivateRoute */}
      <Route
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
        path="/admin/dashboard"
      />

      {/* Redirect root ke dashboard */}
      <Route element={<Navigate replace to="/admin/dashboard" />} path="/" />

      {/* Jika ingin menambahkan NotFound di masa depan */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
