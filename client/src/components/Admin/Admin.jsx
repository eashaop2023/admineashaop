// src/components/Admin/Admin.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

// Admin Pages
import Dashboard from "./Dashboard/Dashboard.jsx";
import ManageDoctor from "./ManageDoctors/ManageDoctors";
import ManagePatient from "./ManagePatients/ManagePatients";
import Billing from "./Billing/Billing.jsx";
import Appointments from "./Dashboard/Appointments/appointments";
import Revenue from "./Dashboard/Revenue/revenue";
import Queries from "./Dashboard/Queries/queries";

import "../../App.css";

const Admin = () => {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>

        <div className="main-content p-3">
          <div className="d-none d-lg-block">
            <Routes>
              {/* index route shows Dashboard */}
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="doctors" element={<ManageDoctor />} />
              <Route path="patients" element={<ManagePatient />} />
              <Route path="billing" element={<Billing />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="queries" element={<Queries />} />

              {/* fallback to dashboard */}
              <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="d-lg-none">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="doctors" element={<ManageDoctor />} />
          <Route path="patients" element={<ManagePatient />} />
          <Route path="billing" element={<Billing />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="queries" element={<Queries />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </>
  );
};

export default Admin;
