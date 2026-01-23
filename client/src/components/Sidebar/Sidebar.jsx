
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Navbar, Offcanvas, Nav } from "react-bootstrap";
import { FaBars } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { FaStethoscope, FaUserInjured } from "react-icons/fa6";
import { FaMoneyCheckAlt, FaCalendarCheck } from "react-icons/fa";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();

  const linkClass = ({ isActive }) =>
    `sidebar-link ${isActive ? "active" : ""}`;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="d-none d-lg-block sidebar-container">
        <Nav className="flex-column">
          <NavLink to="/admin/dashboard" className={linkClass}>
            <MdDashboard /> <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/doctors" className={linkClass}>
            <FaStethoscope /> <span>Manage Doctors</span>
          </NavLink>

          <NavLink to="/admin/patients" className={linkClass}>
            <FaUserInjured /> <span>Manage Patients</span>
          </NavLink>

          <NavLink to="/admin/appointments" className={linkClass}>
            <FaCalendarCheck /> <span>Appointments</span>
          </NavLink>

          <NavLink to="/admin/billing" className={linkClass}>
            <FaMoneyCheckAlt /> <span>Billing / Payments</span>
          </NavLink>
        </Nav>
      </div>

      {/* MOBILE TOP BAR */}
      <Navbar bg="light" className="d-lg-none border-bottom px-3">
        <FaBars size={22} onClick={() => setShow(true)} />
        <span className="ms-3 fw-semibold">
          {location.pathname.split("/").pop()?.toUpperCase() || "MENU"}
        </span>
      </Navbar>

      {/* MOBILE SIDEBAR */}
      <Offcanvas show={show} onHide={() => setShow(false)} placement="start">
        <Offcanvas.Body>
          <Nav className="flex-column">
            <NavLink to="/admin/dashboard" onClick={() => setShow(false)} className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/doctors" onClick={() => setShow(false)} className={linkClass}>
              Manage Doctors
            </NavLink>
            <NavLink to="/admin/patients" onClick={() => setShow(false)} className={linkClass}>
              Manage Patients
            </NavLink>
            <NavLink to="/admin/appointments" onClick={() => setShow(false)} className={linkClass}>
              Appointments
            </NavLink>
            <NavLink to="/admin/billing" onClick={() => setShow(false)} className={linkClass}>
              Billing
            </NavLink>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
