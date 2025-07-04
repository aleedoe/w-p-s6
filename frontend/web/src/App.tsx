import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./contexts/auth-context";
import LoginPage from "./pages/login";
import DashboardLayout from "./layouts/dashboard-layout";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import Orders from "./pages/orders";
import Shipping from "./pages/shipping";
import Returns from "./pages/returns";
// import Orders from "./pages/orders";
// import Shipping from "./pages/shipping";
// import NotFound from "./pages/not-found";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div>Loading...</div>; // bisa diganti dengan spinner
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <Routes>
      {/* Halaman Login */}
      <Route element={<LoginPage />} path="/login" />

      {/* Halaman Dashboard */}
      <Route
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
        path="/admin/dashboard"
      />

      {/* Halaman Products */}
      <Route
        element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        }
        path="/admin/products"
      />

      {/* Halaman Orders */}
      <Route
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
        path="/admin/orders"
      />

      {/* Halaman Shipping */}
      <Route
        element={
          <PrivateRoute>
            <Shipping />
          </PrivateRoute>
        }
        path="/admin/shipping"
      />

      {/* Halaman Returns */}
      <Route
        element={
          <PrivateRoute>
            <Returns />
          </PrivateRoute>
        }
        path="/admin/returns"
      />

      {/* Redirect root ke dashboard */}
      <Route element={<Navigate replace to="/admin/products" />} path="/" />

      {/* Halaman NotFound untuk semua path tak dikenal */}
      {/* <Route element={<NotFound />} path="*" /> */}
    </Routes>
  );
}

export default App;
