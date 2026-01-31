

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

import Dashboard from "./Dashboard/Dashboard";
import ManageDoctors from "./ManageDoctors/ManageDoctors";

import TotalDoctors from "./ManageDoctors/TotalDoctors";
import PendingDoctors from "./ManageDoctors/PendingDoctors";
import VerifiedDoctors from "./ManageDoctors/VerifiedDoctors";
import CurrentView from "./ManageDoctors/CurrentView";

import ManagePatient from "./ManagePatients/ManagePatients";
import Billing from "./Billing/Billing";
import Appointments from "./Dashboard/Appointments/appointments";
import Revenue from "./Dashboard/Revenue/revenue";
import Queries from "./Dashboard/Queries/queries";

import "../../App.css";

const Admin = () => {
  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <aside className="sidebar-wrapper">
          <Sidebar />
        </aside>

        <main className="main-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* DOCTOR ROUTES */}
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="doctors/all" element={<TotalDoctors />} />
            <Route path="doctors/pending" element={<PendingDoctors />} />
            <Route path="doctors/verified" element={<VerifiedDoctors />} />
            <Route path="doctors/current-view" element={<CurrentView />} />

            <Route path="patients" element={<ManagePatient />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="billing" element={<Billing />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="queries" element={<Queries />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </main>
      </div>
    </>
  );
};

export default Admin;
