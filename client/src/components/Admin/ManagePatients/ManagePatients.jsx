import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Form,
  Button,
  Modal,
  Spinner,
  Badge,
  InputGroup,
} from "react-bootstrap";
import {
  FaUser,
  FaFileAlt,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaBirthdayCake,
  FaIdCard,
  FaHome,
  FaRulerVertical,
  FaWeight,
  FaLanguage,
  FaExternalLinkAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import "./ManagePatient.css";

const PatientsManagement = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Stats for growth indicators
  const [stats, setStats] = useState({
    previousPatients: 0,
    previousDocuments: 0,
    previousAppointments: 0
  });

  // ===== Fetch all patients =====
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please login.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const patientsData = response.data.users || [];
        setPatients(patientsData);
        
        // Simulate previous stats for growth calculation
        setStats({
          previousPatients: Math.floor(patientsData.length * 0.85),
          previousDocuments: Math.floor(patientsData.filter(p => p.documents?.length > 0).length * 0.78),
          previousAppointments: Math.floor(patientsData.reduce((acc, patient) => 
            acc + (patient.appointments?.length || 0), 0) * 0.82
          )
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch patients"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // ===== Fetch single patient details =====
  const handleViewDetails = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login again");

    setDetailsLoading(true);
    setShowPatientModal(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedPatient(response.data.user);
    } catch (err) {
      alert("Failed to load patient details");
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ===== Filter patients =====
  const filteredPatients = Array.isArray(patients)
    ? patients.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          p.email?.toLowerCase().includes(search.toLowerCase()) ||
          p.phone_number?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Calculate growth percentages
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const patientsWithDocuments = patients.filter(
    (p) => p.documents?.length > 0
  ).length;

  const totalAppointments = patients.reduce(
    (acc, patient) => acc + (patient.appointments?.length || 0), 0
  );

  const growthRates = {
    patients: calculateGrowth(patients.length, stats.previousPatients),
    documents: calculateGrowth(patientsWithDocuments, stats.previousDocuments),
    appointments: calculateGrowth(totalAppointments, stats.previousAppointments)
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%2300A99D'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='14' font-weight='bold'%3E%3Ctspan x='20' dy='0'%3E%3C/tspan%3E%3C/text%3E%3C/svg%3E";
  };

  const GrowthIndicator = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <div className={`growth-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading)
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading patients...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="text-danger">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );

  return (
    <Container fluid className="manage-patients-container">
      {/* ===== Header Section ===== */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Patient Management</h1>
          <p className="dashboard-subtitle">Manage and monitor all patient information and records</p>
        </div>
        <div className="header-badge">
          <span>Total Patients: {patients.length}</span>
        </div>
      </div>

      {/* ===== Stats Cards ===== */}
      <Row className="stats-row">
        <Col xl={3} lg={4} md={6} className="mb-4">
          <Card className="stat-card total-patients h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon primary">
                  <FaUser size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{patients.length}</h3>
                  <p className="stat-title">Total Patients</p>
                  <GrowthIndicator value={growthRates.patients} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={4} md={6} className="mb-4">
          <Card className="stat-card documents-stats h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon success">
                  <FaFileAlt size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{patientsWithDocuments}</h3>
                  <p className="stat-title">With Documents</p>
                  <GrowthIndicator value={growthRates.documents} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={4} md={6} className="mb-4">
          <Card className="stat-card appointment-stats h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon warning">
                  <FaCalendarAlt size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{totalAppointments}</h3>
                  <p className="stat-title">Total Appointments</p>
                  <GrowthIndicator value={growthRates.appointments} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={4} md={6} className="mb-4">
          <Card className="stat-card search-stats h-100">
            <Card.Body>
              <div className="stat-content">
                <div className="stat-icon danger">
                  <FaSearch size={24} />
                </div>
                <div className="stat-info">
                  <h3 className="stat-value">{filteredPatients.length}</h3>
                  <p className="stat-title">Search Results</p>
                  <div className="growth-indicator neutral">
                    <span>Live</span>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ===== Search and Content Section ===== */}
      <Card className="content-card">
        <Card.Header className="content-card-header">
          <h5 className="mb-0">
            <FaUser className="me-2" />
            Patient Directory
            <Badge bg="primary" className="ms-2">
              {filteredPatients.length}
            </Badge>
          </h5>
          <div className="header-actions">
            <InputGroup className="search-input-group">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearch("")}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="patient-table mb-0">
              <thead>
                <tr>
                  <th>Patient Information</th>
                  <th className="d-none d-md-table-cell">Contact</th>
                  <th>Documents</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="table-row">
                    <td>
                      <div className="patient-info">
                        <div className="avatar patient-avatar">
                          <img
                            src={patient.profileImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%2300A99D'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='14' font-weight='bold'%3E%3Ctspan x='20' dy='0'%3E%3C/tspan%3E%3C/text%3E%3C/svg%3E"}
                            alt={patient.full_name}
                            className="avatar-img"
                            onError={handleImageError}
                          />
                        </div>
                        <div className="user-details">
                          <h6 className="user-name">{patient.full_name || "Unknown"}</h6>
                          <span className="user-contact">{patient.phone_number || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="d-none d-md-table-cell">
                      <div className="contact-info">
                        <div className="contact-item">
                          <FaEnvelope className="me-2 text-muted" size={12} />
                          <span>{patient.email || "N/A"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge className={`documents-badge ${patient.documents?.length > 0 ? 'has-documents' : 'no-documents'}`}>
                        <FaFileAlt className="me-1" />
                        {patient.documents?.length || 0}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewDetails(patient._id)}
                        className="view-btn"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="4" className="no-data-cell">
                      <div className="no-data-content">
                        <FaUser className="no-data-icon" />
                        <h5>No patients found</h5>
                        <p>Try adjusting your search criteria</p>
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
        </Card.Body>
      </Card>

      {/* ===== Patient Details Modal ===== */}
      <Modal
        show={showPatientModal}
        onHide={() => setShowPatientModal(false)}
        size="xl"
        centered
        className="patient-details-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            <FaUser className="me-2" />
            Patient Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {detailsLoading ? (
            <div className="modal-loading">
              <Spinner animation="border" variant="primary" />
              <p>Loading patient details...</p>
            </div>
          ) : selectedPatient ? (
            <div className="patient-details-content">
              {/* Profile Header */}
              <div className="profile-header">
                <div className="profile-avatar">
                  <img
                    src={selectedPatient.profileImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%2300A99D'/%3E%3Ctext x='40' y='52' text-anchor='middle' fill='white' font-size='32' font-weight='bold'%3E%3Ctspan x='40' dy='0'%3E%3C/tspan%3E%3C/text%3E%3C/svg%3E"}
                    alt={selectedPatient.full_name}
                    onError={handleImageError}
                  />
                </div>
                <div className="profile-info">
                  <h3>{selectedPatient.full_name || "Unknown Patient"}</h3>
                  <div className="profile-contacts">
                    <div className="contact-item">
                      <FaEnvelope className="me-2" />
                      <span>{selectedPatient.email || "N/A"}</span>
                    </div>
                    <div className="contact-item">
                      <FaPhone className="me-2" />
                      <span>{selectedPatient.phone_number || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="info-grid">
                <Card className="info-card">
                  <Card.Body>
                    <h5 className="card-title">
                      <FaUser className="me-2" />
                      Personal Information
                    </h5>
                    <div className="info-list">
                      <div className="info-item">
                        <label>Gender</label>
                        <span>{selectedPatient.gender || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <label>Date of Birth</label>
                        <span>
                          {selectedPatient.dob
                            ? new Date(selectedPatient.dob).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>Aadhaar Number</label>
                        <span>{selectedPatient.aadhaar_number || "N/A"}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="info-card">
                  <Card.Body>
                    <h5 className="card-title">
                      <FaHome className="me-2" />
                      Contact Information
                    </h5>
                    <div className="info-list">
                      <div className="info-item">
                        <label>Address</label>
                        <span>{selectedPatient.address || "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <label>Preferred Language</label>
                        <span>{selectedPatient.language_preferred || "N/A"}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="info-card">
                  <Card.Body>
                    <h5 className="card-title">
                      <FaRulerVertical className="me-2" />
                      Physical Information
                    </h5>
                    <div className="info-list">
                      <div className="info-item">
                        <label>Height</label>
                        <span>{selectedPatient.height ? `${selectedPatient.height} cm` : "N/A"}</span>
                      </div>
                      <div className="info-item">
                        <label>Weight</label>
                        <span>{selectedPatient.weight ? `${selectedPatient.weight} kg` : "N/A"}</span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <Card className="info-card">
                  <Card.Body>
                    <h5 className="card-title">
                      <FaCalendarAlt className="me-2" />
                      Appointments Summary
                    </h5>
                    <div className="info-list">
                      <div className="info-item">
                        <label>Total Appointments</label>
                        <span className="appointment-count">
                          {selectedPatient.appointments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Appointment History */}
              {selectedPatient.appointments && selectedPatient.appointments.length > 0 && (
                <Card className="appointments-card">
                  <Card.Body>
                    <h5 className="card-title">
                      <FaCalendarAlt className="me-2" />
                      Appointment History
                    </h5>
                    <div className="appointments-table">
                      <Table hover responsive>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Doctor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedPatient.appointments.map((appointment, index) => (
                            <tr
                              key={index}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowAppointmentModal(true);
                              }}
                              className="appointment-row"
                            >
                              <td>
                                {appointment.date 
                                  ? new Date(appointment.date).toLocaleDateString()
                                  : "N/A"
                                }
                              </td>
                              <td>{appointment.time || "N/A"}</td>
                              <td>
                                <Badge 
                                  className={`status-badge ${appointment.status?.toLowerCase() || 'pending'}`}
                                >
                                  {appointment.status || "Pending"}
                                </Badge>
                              </td>
                              <td>{appointment.doctorName || appointment.doctorId || "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          ) : (
            <div className="no-data-message">
              <p>No patient data available.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="primary" onClick={() => setShowPatientModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== Appointment Details Modal ===== */}
      <Modal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        centered
        className="appointment-details-modal"
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>
            <FaCalendarAlt className="me-2" />
            Appointment Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div className="appointment-details">
              <div className="detail-item">
                <label>Date</label>
                <span>
                  {selectedAppointment.date 
                    ? new Date(selectedAppointment.date).toLocaleDateString()
                    : "N/A"
                  }
                </span>
              </div>
              <div className="detail-item">
                <label>Time</label>
                <span>{selectedAppointment.time || "N/A"}</span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <Badge className={`status-badge ${selectedAppointment.status?.toLowerCase() || 'pending'}`}>
                  {selectedAppointment.status || "Pending"}
                </Badge>
              </div>
              <div className="detail-item">
                <label>Doctor</label>
                <span>{selectedAppointment.doctorName || selectedAppointment.doctorId || "N/A"}</span>
              </div>
              {selectedAppointment.jitsiLink && (
                <div className="detail-item">
                  <label>Meeting Link</label>
                  <a
                    href={selectedAppointment.jitsiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="meeting-link"
                  >
                    Join Meeting <FaExternalLinkAlt size={12} />
                  </a>
                </div>
              )}
              {selectedAppointment.notes && (
                <div className="detail-item">
                  <label>Notes</label>
                  <div className="notes-content">
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="primary" onClick={() => setShowAppointmentModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PatientsManagement;