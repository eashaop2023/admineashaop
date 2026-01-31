import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";
import {
  Container,
  Table,
  Badge,
  Button,
  Card,
  InputGroup,
  Form,
  Modal,
} from "react-bootstrap";
import {
  BsArrowLeft,
  BsSearch,
  BsEye,
  BsTrash,
  BsCheckLg,
  BsClockHistory,
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import "./ManageDoctors.css"; // 

const VerifiedDoctors = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVerifiedDoctors();
  }, []);

  const fetchVerifiedDoctors = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/admin/doctors`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const verified = res.data.doctors.filter(
      (doc) => doc.isApproved === true
    );

    setDoctors(verified);
  };

  const handleView = async (id) => {
    const res = await axios.get(
      `${API_BASE_URL}/api/admin/doctors/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setSelectedDoctor(res.data.doctor || res.data);
    setShowModal(true);
  };


  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this doctor?")) return;

  try {
    await axios.delete(
      `${API_BASE_URL}/api/admin/doctors/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setDoctors((prev) => prev.filter((doc) => doc._id !== id));

    alert("Doctor deleted successfully");
  } catch (error) {
    console.error("Delete failed:", error);
    alert("Failed to delete doctor");
  }
};


const filteredDoctors = doctors.filter((doc) => {
  const searchText = search.toLowerCase().trim();

  return (
    doc.name?.toLowerCase().includes(searchText) ||
    doc.speciality?.toLowerCase().includes(searchText) ||
    doc.email?.toLowerCase().includes(searchText) ||
    doc.hospitalName?.toLowerCase().includes(searchText)
  );
});


  return (
    <Container fluid className="manage-doctors-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="d-flex align-items-center gap-3">
          <Button
            variant="outline-success"
            onClick={() => navigate(-1)} >
            <BsArrowLeft /> Back to Manage Doctors
          </Button>
          <h2 className="dashboard-title mb-0">Verified Doctors</h2>
        </div>
      </div>

      {/* Content Card */}
      <Card className="content-card">
        <Card.Header className="content-card-header">
          <h5 className="mb-0">
            <BsCheckLg className="me-2" />
            Active Doctors
          </h5>

          <InputGroup className="search-input-group">
            <InputGroup.Text>
              <BsSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search verified doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Card.Header>

        <Card.Body className="p-0">
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
                            <div className="user-name">{doc.name}</div>
                            <div className="user-contact">
                              {doc.gender} • {doc.age} yrs
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{doc.speciality}</td>

                      <td className="d-none d-md-table-cell">
                        {doc.email}
                      </td>

                      <td>{doc.mobile}</td>

                      <td className="d-none d-sm-table-cell">
                        {doc.hospitalName}
                      </td>

                      <td>
                        <Badge className="status-badge verified">
                          Verified
                        </Badge>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <Button
                            className="view-profile-btn"
                            size="sm"
                            onClick={() => handleView(doc._id)}
                          >
                            <BsEye className="me-1" />
                            View Profile
                          </Button>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDelete(doc._id)}
                            size="sm"
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
                        <h5>No verified doctors</h5>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
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
};

export default VerifiedDoctors;


