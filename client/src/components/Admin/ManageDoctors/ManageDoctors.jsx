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


      {/* Content Card with Tabs */}
     <Card className="content-card">
        <Card.Header className="content-card-header">
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-3">
              <BsListCheck className="me-2" />
              Doctors Management
            </h5>
            <Nav variant="pills" className="doctors-tabs">
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === "pending"} 
                  onClick={() => setActiveTab("pending")}
                  className="pending-tab"
                >
                  <BsClockHistory className="me-1" />
                  Pending Verification
                  {doctorsToVerify.length > 0 && (
                    <Badge bg="warning" className="ms-1 tab-badge">
                      {doctorsToVerify.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  active={activeTab === "verified"} 
                  onClick={() => setActiveTab("verified")}
                  className="verified-tab"
                >
                  <BsCheckLg className="me-1" />
                  Verified Doctors
                  {activeDoctors.length > 0 && (
                    <Badge bg="success" className="ms-1 tab-badge">
                      {activeDoctors.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
          <div className="header-actions">
            <InputGroup className="search-input-group">
              <InputGroup.Text>
                <BsSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder={`Search ${activeTab === 'pending' ? 'pending' : 'verified'} doctors...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </div>
        </Card.Header>
         <Card.Body className="p-0"> 


          {/* Tab Content */}
          
       <div className="tab-content">
            {/* Pending Verification Tab */}
           {activeTab === "pending" && (
              <div className="tab-pane active">
                <div className="table-responsive">
                  <Table hover className="doctor-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialty</th>
                        <th className="d-none d-md-table-cell">Email</th>
                        <th>Mobile</th>
                        <th className="d-none d-sm-table-cell">Hospital</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doc) => (
                          <tr key={doc._id} className="table-row">
                            <td>
                              <div className="doctor-info">
                                <div className="avatar patient-avatar">
                                  <img 
                                    src={doc.profileImage || "/api/placeholder/40/40"} 
                                    alt={doc.name}
                                    className="avatar-img"
                                  />
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{truncateText(doc.name, 20)}</div>
                                  <div className="user-contact">{doc.gender} • {doc.age} yrs</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span title={doc.speciality}>
                                {truncateText(doc.speciality)}
                              </span>
                            </td>
                            <td className="d-none d-md-table-cell">
                              <div className="contact-info">
                                <span className="contact-item" title={doc.email}>
                                  {truncateText(doc.email, 25)}
                                </span>
                              </div>
                            </td>
                            <td>{doc.mobile}</td>
                            <td className="d-none d-sm-table-cell">
                              <span title={doc.hospitalName}>
                                {truncateText(doc.hospitalName)}
                              </span>
                            </td>
                            <td>
                              <Badge bg="warning" text="dark" className="status-badge pending">
                                Pending Review
                              </Badge>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  size="sm"
                                  className="btn-accept me-2"
                                  onClick={() => handleAccept(doc._id)}
                                >
                                  <BsCheckLg className="me-1" />
                                  Verify
                                </Button>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="view-profile-btn me-2"
                                  onClick={() => handleView(doc._id)}
                                >
                                  <BsEye className="me-1" />
                                  View Profile
                                </Button>
                                <Button
                                 type="button"   
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(doc._id)}
                                >
                                  <BsTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5">
                            <div className="empty-state">
                              <BsClockHistory className="empty-icon" />
                              <h5 className="mt-3">No Pending Verifications</h5>
                              <p className="text-muted mb-3">All doctors have been verified</p>
                              {search && (
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => setSearch("")}
                                >
                                  Clear Search
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}

            {/* Verified Doctors Tab */}
          
            {activeTab === "verified" && (
              <div className="tab-pane active">
                <div className="table-responsive">
                  <Table hover className="doctor-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Specialty</th>
                        <th className="d-none d-md-table-cell">Email</th>
                        <th>Mobile</th>
                        <th className="d-none d-sm-table-cell">Hospital</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doc) => (
                          <tr key={doc._id} className="table-row">
                            <td>
                              <div className="doctor-info">
                                <div className="avatar patient-avatar">
                                  <img 
                                    src={doc.profileImage || "/api/placeholder/40/40"} 
                                    alt={doc.name}
                                    className="avatar-img"
                                  />
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{truncateText(doc.name, 20)}</div>
                                  <div className="user-contact">{doc.gender} • {doc.age} yrs</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span title={doc.speciality}>
                                {truncateText(doc.speciality)}
                              </span>
                            </td>
                            <td className="d-none d-md-table-cell">
                              <div className="contact-info">
                                <span className="contact-item" title={doc.email}>
                                  {truncateText(doc.email, 25)}
                                </span>
                              </div>
                            </td>
                            <td>{doc.mobile}</td>
                            <td className="d-none d-sm-table-cell">
                              <span title={doc.hospitalName}>
                                {truncateText(doc.hospitalName)}
                              </span>
                            </td>
                            <td>
                              <Badge bg="success" className="status-badge verified">
                                Verified
                              </Badge>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="view-profile-btn me-2"
                                  onClick={() => handleView(doc._id)}
                                >
                                  <BsEye className="me-1" />
                                  View Profile
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(doc._id)}
                                >
                                  <BsTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-5">
                            <div className="empty-state">
                              <BsPersonBadge className="empty-icon" />
                              <h5 className="mt-3">No Verified Doctors</h5>
                              <p className="text-muted mb-3">
                                {search ? "No doctors match your search" : "No doctors have been verified yet"}
                              </p>
                              {search && (
                                <Button 
                                  variant="outline-primary" 
                                  size="sm"
                                  onClick={() => setSearch("")}
                                >
                                  Clear Search
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Doctor Details Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        className="doctor-details-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex align-items-center">
              <span>Doctor Profile</span>
              {selectedDoctor?.isApproved ? (
                <Badge bg="success" className="ms-2">
                  <BsCheckLg className="me-1" />
                  Verified
                </Badge>
              ) : (
                <Badge bg="warning" text="dark" className="ms-2">
                  <BsClockHistory className="me-1" />
                  Pending Verification
                </Badge>
              )}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedDoctor && (
            <div className="patient-details-content">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-avatar">
                  <img
                    src={selectedDoctor.profileImage || "/api/placeholder/120/120"}
                    alt={selectedDoctor.name}
                  />
                </div>
                <div className="profile-info">
                  <h3>{selectedDoctor.name}</h3>
                  <div className="profile-contacts">
                    <div className="contact-item">
                      <strong>Specialty:</strong> {selectedDoctor.speciality}
                    </div>
                    <div className="contact-item">
                      <strong>Consultation Fee:</strong> ₹{selectedDoctor.consultationFee}
                    </div>
                    <div className="contact-item">
                      <strong>Mode:</strong> {selectedDoctor.consultationMode}
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="info-grid">
                <Card className="info-card">
                  <Card.Body>
                    <Card.Title>Personal Information</Card.Title>
                    <div className="info-list">
                      <div className="info-item">
                        <label>Gender</label>
                        <span>{selectedDoctor.gender}</span>
                      </div>
                      <div className="info-item">
                        <label>Age</label>
                        <span>{selectedDoctor.age}</span>
                      </div>
                      <div className="info-item">
                        <label>Email</label>
                        <span>{selectedDoctor.email}</span>
                      </div>
                      <div className="info-item">
                        <label>Mobile</label>
                        <span>{selectedDoctor.mobile}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="info-card">
                  <Card.Body>
                    <Card.Title>Professional Information</Card.Title>
                    <div className="info-list">
                      <div className="info-item">
                        <label>Education</label>
                        <span>{selectedDoctor.education}</span>
                      </div>
                      <div className="info-item">
                        <label>University</label>
                        <span>{selectedDoctor.university}</span>
                      </div>
                      <div className="info-item">
                        <label>Languages</label>
                        <span>{selectedDoctor.languages?.join(", ") || "Not specified"}</span>
                      </div>
                      <div className="info-item">
                        <label>Experience</label>
                        <span>{selectedDoctor.experience || "Not specified"}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="info-card">
                  <Card.Body>
                    <Card.Title>Hospital Information</Card.Title>
                    <div className="info-list">
                      <div className="info-item">
                        <label>Hospital Name</label>
                        <span>{selectedDoctor.hospitalName}</span>
                      </div>
                      <div className="info-item">
                        <label>Location</label>
                        <span>{selectedDoctor.hospitalLocation}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {selectedDoctor.about && (
                  <Card className="info-card">
                    <Card.Body>
                      <Card.Title>About Doctor</Card.Title>
                      <p className="about-text">{selectedDoctor.about}</p>
                    </Card.Body>
                  </Card>
                )}
              </div>

              {/* Certificates Section */}
              {selectedDoctor.medicalCertificates?.length > 0 && (
                <Card className="appointments-card">
                  <Card.Body>
                    <Card.Title>Medical Certificates</Card.Title>
                    <div className="certificates-grid">
                      {selectedDoctor.medicalCertificates.map((cert, index) => (
                        <div key={cert._id || index} className="certificate-item">
                          <Badge bg="light" text="dark" className="certificate-badge">
                            <a
                              href={cert.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="certificate-link"
                            >
                              {cert.type || `Certificate ${index + 1}`}
                            </a>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedDoctor && !selectedDoctor.isApproved && (
            <Button 
              variant="primary" 
              onClick={() => {
                handleAccept(selectedDoctor._id);
                setShowModal(false);
              }}
            >
              <BsCheckLg className="me-1" />
              Verify Doctor
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
    </Container>
  );
}

export default ManageDoctors;