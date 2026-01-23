// src/components/Navbar/Navbar.jsx
import React from "react";
import { Navbar, Container, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import logo from "../../assets/eAshalogo.png";
import profile from "../../assets/profile.png";
import { API_BASE_URL } from "../../api-config";

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 🔹 Call your backend logout API
      const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
        method: "POST", // or "GET" depending on your backend
        headers: {
          "Content-Type": "application/json",
          // Include token if your API needs it
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        // if backend uses cookies/session
        // credentials: "include",
      });

      if (!response.ok) {
        console.error("Logout API failed");
      }

      // 🔹 Always clear token locally
      localStorage.removeItem("adminToken");

      // 🔹 Navigate to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      // 🔹 Clear token anyway and redirect
      localStorage.removeItem("adminToken");
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <style>
        {`

          .nav-left {
            margin-left: 48px;
          }
          .nav-right {
            margin-right: 48px;
          }
          @media (max-width: 576px) {
            .nav-left {
              margin-left: 10px !important;
            }
            .nav-right {
              margin-right: 20px !important;
            }
          }
          .navbar-fixed-top {
            z-index: 1100 !important;
          }
          #dropdown-profile::after {
            display: none !important;
          }
          .dropdown-menu {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .dropdown-item.logout-btn {
            background-color: #dc3545 !important;
            color: #fff !important;
            text-align: center;
            font-weight: 600;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            padding: 10px 0 !important;
          }
          .dropdown-item.logout-btn:hover,
          .dropdown-item.logout-btn:active {
            background-color: #b52a37 !important;
            color: #fff !important;
          }
        `}
      </style>

      <Navbar
        bg="light"
        expand="lg"
        fixed="top"
        className="navbar-fixed-top"
        style={{ minHeight: "70px" }}
      >
        <Container fluid>
          <Navbar.Brand href="/" className="nav-left">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "80px", height: "60px", objectFit: "contain" }}
            />
          </Navbar.Brand>

          <div
            className="ms-auto d-flex align-items-center nav-right"
            style={{ gap: "40px" }}
          >
            <span style={{ fontSize: "24px", cursor: "pointer" }}>
              <i className="bi bi-bell"></i>
            </span>

            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                id="dropdown-profile"
                className="d-flex flex-column align-items-center"
                style={{ cursor: "pointer" }}
              >
                <img
                  src={profile}
                  alt="Profile"
                  className="rounded-circle"
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "cover",
                    border: "2px solid #ddd",
                  }}
                />
                <span className="mt-1" style={{ fontSize: "14px", color: "#555" }}>
                  Admin
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={handleLogout} className="logout-btn">
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default NavBar;
