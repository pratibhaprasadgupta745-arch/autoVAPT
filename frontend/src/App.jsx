import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Scan from "./pages/Scan";
import Vulnerabilities from "./pages/Vulnerabilities";
import ScanReport from "./pages/ScanReport";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";

import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />

          {/* 🔥 EXISTING */}
          <Route path="/scan-report/:id" element={<ScanReport />} />

          {/* 🔥 FIX ADDED (important) */}
          <Route path="/report/:id" element={<ScanReport />} />

          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;