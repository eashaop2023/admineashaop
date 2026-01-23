// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Navbar from "../Navbar/Navbar";
// import Sidebar from "../Sidebar/Sidebar";

// // Admin Pages
// import Dashboard from "./Dashboard/Dashboard.jsx";
// import ManageDoctor from "./ManageDoctors/ManageDoctors";
// import ManagePatient from "./ManagePatients/ManagePatients";
// import Billing from "./Billing/Billing.jsx";
// import Appointments from "./Dashboard/Appointments/appointments";
// import Revenue from "./Dashboard/Revenue/revenue";
// import Queries from "./Dashboard/Queries/queries";

// import "../../App.css";

// const Admin = () => {
//   return (
//     <>
//       <Navbar />

//       <div className="app-container">
//         <div className="sidebar-wrapper">
//           <Sidebar />
//         </div>

//         <div className="main-content p-3">
//           <Routes>
//             <Route index element={<Dashboard />} />
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="doctors" element={<ManageDoctor />} />
//             <Route path="patients" element={<ManagePatient />} />
//             <Route path="billing" element={<Billing />} />
//             <Route path="appointments" element={<Appointments />} />
//             <Route path="revenue" element={<Revenue />} />
//             <Route path="queries" element={<Queries />} />

//             <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
//           </Routes>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Admin;








// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// import Sidebar from "../components/Sidebar";
// import AdminNavbar from "../components/AdminNavbar";

// // pages
// import Dashboard from "./Dashboard";
// import ManageDoctors from "./ManageDoctors";
// import ManagePatients from "./ManagePatients";
// import Appointments from "./Appointments";
// import Billing from "./Billing";

// const Admin = () => {
//   return (
//     <>
//       {/* TOP NAVBAR */}
//       <AdminNavbar />

//       {/* SIDEBAR + MAIN CONTENT */}
//       <div className="app-container">
//         {/* SIDEBAR */}
//         <div className="sidebar-wrapper">
//           <Sidebar />
//         </div>

//         {/* MAIN CONTENT */}
//         <div className="main-content">
//           <Routes>
//             <Route path="/" element={<Navigate to="dashboard" replace />} />
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="doctors" element={<ManageDoctors />} />
//             <Route path="patients" element={<ManagePatients />} />
//             <Route path="appointments" element={<Appointments />} />
//             <Route path="billing" element={<Billing />} />
//           </Routes>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Admin;






// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import Navbar from "../Navbar/Navbar";
// import Sidebar from "../Sidebar/Sidebar";

// import Dashboard from "./Dashboard/Dashboard";
// import ManageDoctor from "./ManageDoctors/ManageDoctors";
// import ManagePatient from "./ManagePatients/ManagePatients";
// import Billing from "./Billing/Billing";
// import Appointments from "./Dashboard/Appointments/appointments";
// import Revenue from "./Dashboard/Revenue/revenue";
// import Queries from "./Dashboard/Queries/queries";

// import "../../App.css";

// const Admin = () => {
//   return (
//     <>
//       {/* TOP NAVBAR */}
//       <Navbar />

//       <div className="app-container">
//         {/* LEFT SIDEBAR */}
//         <div className="sidebar-wrapper">
//           <Sidebar />
//         </div>

//         {/* RIGHT CONTENT */}
//         <div className="main-content p-3">
//           <Routes>
//             <Route index element={<Dashboard />} />
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="doctors" element={<ManageDoctor />} />
//             <Route path="patients" element={<ManagePatient />} />
//             <Route path="appointments" element={<Appointments />} />
//             <Route path="billing" element={<Billing />} />
//             <Route path="revenue" element={<Revenue />} />
//             <Route path="queries" element={<Queries />} />
//             <Route path="*" element={<Navigate to="dashboard" />} />
//           </Routes>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Admin;










import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";

import Dashboard from "./Dashboard/Dashboard";
import ManageDoctor from "./ManageDoctors/ManageDoctors";
import ManagePatient from "./ManagePatients/ManagePatients";
import Billing from "./Billing/Billing";
import Appointments from "./Dashboard/Appointments/appointments";
import Revenue from "./Dashboard/Revenue/revenue";
import Queries from "./Dashboard/Queries/queries";

import "../../App.css";

const Admin = () => {
  return (
    <>
      {/* TOP NAVBAR */}
      <Navbar />

      {/* MAIN LAYOUT */}
      <div className="admin-layout">
        {/* SIDEBAR */}
        <aside className="sidebar-wrapper">
          <Sidebar />
        </aside>

        {/* PAGE CONTENT */}
        <main className="main-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="doctors" element={<ManageDoctor />} />
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
