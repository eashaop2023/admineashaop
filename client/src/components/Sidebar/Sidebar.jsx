import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Offcanvas, Nav } from "react-bootstrap";
import { FaBars } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { FaStethoscope, FaUserInjured } from "react-icons/fa6";
import { FaMoneyCheckAlt, FaCalendarCheck } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const getPageTitle = (path) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/doctors":
        return "Manage Doctors";
      case "/patients":
        return "Manage Patients";
      case "/appointments":
        return "Appointments";
      case "/billing":
        return "Billing / Payments";
      default:
        return "";
    }
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <>
      <style>
        {`
          .custom-nav .nav-link {
            color: black !important;
            padding: 10px 15px;
            border-radius: 0;
            position: relative;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .custom-nav .nav-link:hover {
            color: #00A99D !important;
            background-color: #E6F7F4 !important;
          }
          .custom-nav .nav-link.active {
            color: #00A99D !important;
            background-color: #E6F7F4 !important;
          }
          .custom-nav .nav-link.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 4px;
            height: 100%;
            background-color: #00A99D;
          }
          .mobile-navbar {
            width: 100%;
            position: fixed;
            top: 66px;
            bottom: 100px;
            left: 0;
            z-index: 1050;
            height: 66px;
          }
          .offcanvas.offcanvas-start {
            width: 70% !important;
          }
          .mobile-offcanvas.offcanvas-start {
            top: 130px !important; 
            height: calc(100%) !important;
            background-color: white !important;
            border-right: 1px solid #ddd !important;
            box-shadow: none !important;
          }
          .mobile-offcanvas .offcanvas-body {
            margin-top: 0px;
            background-color: white;
          }
          .offcanvas-backdrop {
            display: none !important;
          }
          .desktop-sidebar {
            width: 220px;
            position: fixed;
            top: 70px;
            left: 0;
            height: calc(100vh - 70px);
            overflow-y: auto;
          }
        `}
      </style>

      {/* Mobile Navbar */}
      <Navbar
        bg="white"
        expand={false}
        className="mobile-navbar d-lg-none border-bottom"
        style={{ padding: "30px 20px" }}
      >
        <div className="d-flex align-items-center w-100">
          <FaBars
            size={24}
            onClick={handleShow}
            style={{ cursor: "pointer" }}
            className="me-3"
          />
          <h6 className="mt-0 flex-grow-1">{currentTitle || "Menu"}</h6>
        </div>
      </Navbar>

      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block bg-light p-3 desktop-sidebar">
        <Nav className="flex-column custom-nav">
          <Nav.Item>
            <Link
              to="/dashboard"
              className={`nav-link ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <MdDashboard className="me-2" /> Dashboard
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link
              to="/doctors"
              className={`nav-link ${
                location.pathname === "/doctors" ? "active" : ""
              }`}
            >
              <FaStethoscope className="me-2" /> Manage Doctors
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link
              to="/patients"
              className={`nav-link ${
                location.pathname === "/patients" ? "active" : ""
              }`}
            >
              <FaUserInjured className="me-2" /> Manage Patients
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link
              to="/appointments"
              className={`nav-link ${
                location.pathname === "/appointments" ? "active" : ""
              }`}
            >
              <FaCalendarCheck className="me-2" /> Appointments
            </Link>
          </Nav.Item>

          <Nav.Item>
            <Link
              to="/billing"
              className={`nav-link ${
                location.pathname === "/billing" ? "active" : ""
              }`}
            >
              <FaMoneyCheckAlt className="me-2" /> Billing/Payments
            </Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas
        show={show}
        onHide={handleClose}
        className="d-lg-none mobile-offcanvas"
        placement="start"
        backdrop={false}
        scroll={true}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column custom-nav">
            <Nav.Item>
              <Link
                to="/dashboard"
                onClick={handleClose}
                className={`nav-link ${
                  location.pathname === "/dashboard" ? "active" : ""
                }`}
              >
                <MdDashboard className="me-2" /> Dashboard
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                to="/doctors"
                onClick={handleClose}
                className={`nav-link ${
                  location.pathname === "/doctors" ? "active" : ""
                }`}
              >
                <FaStethoscope className="me-2" /> Manage Doctors
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                to="/patients"
                onClick={handleClose}
                className={`nav-link ${
                  location.pathname === "/patients" ? "active" : ""
                }`}
              >
                <FaUserInjured className="me-2" /> Manage Patients
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                to="/appointments"
                onClick={handleClose}
                className={`nav-link ${
                  location.pathname === "/appointments" ? "active" : ""
                }`}
              >
                <FaCalendarCheck className="me-2" /> Appointments
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link
                to="/billing"
                onClick={handleClose}
                className={`nav-link ${
                  location.pathname === "/billing" ? "active" : ""
                }`}
              >
                <FaMoneyCheckAlt className="me-2" /> Billing/Payments
              </Link>
            </Nav.Item>
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Sidebar;
