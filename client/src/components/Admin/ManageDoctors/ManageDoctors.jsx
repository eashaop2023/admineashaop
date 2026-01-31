import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  Card,
  Modal,
  ListGroup,
  Badge,
  InputGroup,
  Nav,
} from "react-bootstrap";
import { BsTrash, BsEye, BsCheckLg, BsSearch, BsPersonBadge, BsClockHistory, BsFilter, BsListCheck } from "react-icons/bs";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ManageDoctors.css";
import { useNavigate } from "react-router-dom"; // Add this

function ManageDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "verified"

  const token = localStorage.getItem("token");

  // Fetch all doctors
  const fetchDoctors = async () => {
    if (!token) {
      setError("No token found. Please login.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/doctors`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error("Error fetching doctors:", err.response || err);
      setError(
        err.response?.data?.message || err.message || "Failed to fetch doctors"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token]);

  // Accept / Verify doctor
  const handleAccept = async (doctorId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/doctors/${doctorId}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.success) {
        toast.success("Doctor verified successfully!", {
          position: "top-right",
        });
        fetchDoctors();
      } else {
        toast.error(response.data?.message || "Failed to verify doctor", {
          position: "top-right",
        });
      }
    } catch (err) {
      console.error(
        "Error verifying doctor:",
        err.response?.data || err.message
      );
      toast.error(err.response?.data?.message || "Failed to verify doctor", {
        position: "top-right",
      });
    }
  };

  // Delete doctor
  const handleDelete = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/admin/doctors/${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctors((prev) => prev.filter((doc) => doc._id !== doctorId));
        toast.info("Doctor removed successfully", { position: "top-right" });
      } catch (err) {
        console.error("Error deleting doctor:", err.response || err);
        toast.error(err.response?.data?.message || "Failed to delete doctor", {
          position: "top-right",
        });
      }
    }
  };

  // Fetch single doctor for modal
  const handleView = async (doctorId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/doctors/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedDoctor(response.data.doctor || response.data);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching doctor details:", err.response || err);
      toast.error(
        err.response?.data?.message || "Failed to fetch doctor details",
        { position: "top-right" }
      );
    }
  };

  // Filter doctors based on search and active tab
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch = 
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.speciality?.toLowerCase().includes(search.toLowerCase()) ||
      doc.email?.toLowerCase().includes(search.toLowerCase()) ||
      doc.mobile?.toLowerCase().includes(search.toLowerCase()) ||
      doc.hospitalName?.toLowerCase().includes(search.toLowerCase());
    
    if (activeTab === "pending") return matchesSearch && !doc.isApproved;
    if (activeTab === "verified") return matchesSearch && doc.isApproved;
    
    return matchesSearch;
  });

  const doctorsToVerify = doctors.filter((doc) => !doc.isApproved);
  const activeDoctors = doctors.filter((doc) => doc.isApproved);

  // Truncate long text for table display
  const truncateText = (text, maxLength = 25) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading doctors...</span>
      </div>
      <p className="mt-2">Loading doctors...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container text-center">
      <div className="error-icon">⚠️</div>
      <p className="text-danger mt-2">{error}</p>
      <Button variant="primary" onClick={fetchDoctors}>Retry</Button>
    </div>
  );

  return (
    <Container fluid className="manage-doctors-container">
      <ToastContainer autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Manage Doctors</h1>
          <p className="dashboard-subtitle">Review and manage doctor registrations</p>
        </div>
        <div className="header-badge">
          <span>Total Doctors: {doctors.length}</span>
        </div>
      </div>

      {/* Stats Cards */}
<Row className="stats-row">
  {/* 1. Total Doctors Card */}
  <Col xl={3} lg={6} className="mb-3">
    <Card 
      className="stat-card total-doctors" 
      onClick={() => navigate("/admin/doctors/all")} 
      style={{ cursor: "pointer" }}
    >
      <Card.Body>
        <div className="stat-content">
          <div className="stat-icon primary"><BsPersonBadge /></div>
          <div className="stat-info">
            <div className="stat-value">{doctors.length}</div>
            <div className="stat-title">Total Doctors</div>
            <div className="growth-indicator positive"><span>All registered</span></div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>

  {/* 2. Pending Verification Card */}
  <Col xl={3} lg={6} className="mb-3">
    <Card 
      className="stat-card pending-verification" 
      onClick={() => navigate("/admin/doctors/pending")} 
      style={{ cursor: "pointer" }}
    >
      <Card.Body>
        <div className="stat-content">
          <div className="stat-icon warning"><BsClockHistory /></div>
          <div className="stat-info">
            <div className="stat-value">{doctorsToVerify.length}</div>
            <div className="stat-title">Pending Verification</div>
            <div className="growth-indicator neutral"><span>Need approval</span></div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>

  {/* 3. Verified Doctors Card */}
  <Col xl={3} lg={6} className="mb-3">
    <Card 
      className="stat-card active-doctors" 
      onClick={() => navigate("/admin/doctors/verified")} 
      style={{ cursor: "pointer" }}
    >
      <Card.Body>
        <div className="stat-content">
          <div className="stat-icon success"><BsCheckLg /></div>
          <div className="stat-info">
            <div className="stat-value">{activeDoctors.length}</div>
            <div className="stat-title">Verified Doctors</div>
            <div className="growth-indicator positive"><span>Active</span></div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>

  {/* 4. Showing / Current View Card */}
  <Col xl={3} lg={6} className="mb-3">
    <Card 
      className="stat-card search-stats" 
      onClick={() => navigate("/admin/doctors/current-view")} 
      style={{ cursor: "pointer" }}
    >
      <Card.Body>
        <div className="stat-content">
          <div className="stat-icon danger"><BsSearch /></div>
          <div className="stat-info">
            <div className="stat-value">{filteredDoctors.length}</div>
            <div className="stat-title">Showing</div>
            <div className="growth-indicator neutral"><span>Current view</span></div>
          </div>
        </div>
      </Card.Body>
    </Card>
  </Col>
</Row>

      
    </Container>
  );
}

export default ManageDoctors;