import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../../api-config";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  InputGroup,
  Badge,
  Table,
  Spinner,
  Modal,
  Button,
} from "react-bootstrap";
import { HiOutlineUserGroup, HiOutlineCalendar } from "react-icons/hi";
import { FaSearch, FaUserInjured, FaUserMd, FaRupeeSign, FaVideo, FaPhone } from "react-icons/fa";
import { BsClock, BsThreeDotsVertical } from "react-icons/bs";
import "./Appointments.css";

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin-login");
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/admin/appointments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setAppointments(res.data.appointments);
        }
      } catch (err) {
        const message = err.response?.data?.message;
        console.error(err);

        if (message === "Token expired. Please login again.") {
          alert("Session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("admin");
          navigate("/admin-login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [navigate]);

  // Filter appointments based on search term and status filter
  const filteredAppointments = appointments.filter((item) => {
    const matchesSearch = Object.values({
      patient: item.userId?.full_name || "",
      mode: item.type || "",
      doctor: item.doctorId?.name || "",
      date: new Date(item.date).toLocaleDateString(),
      time: item.time || "",
      amount: item.amount?.toString() || "",
      status: item.status || "",
    }).some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === "all" || item.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Open modal and fetch appointment details
  const handleViewDetails = async (appointmentId) => {
    try {
      setModalLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/appointments/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSelectedAppointment(res.data.appointment);
        setShowModal(true);
      }
    } catch (err) {
      console.error("Error fetching appointment details:", err);
      alert("Failed to fetch appointment details.");
    } finally {
      setModalLoading(false);
    }
  };

  // Get status badge variant

  // Get consult mode icon
  const getConsultModeIcon = (type) => {
    return type === "video" ? <FaVideo className="me-1" /> : <FaPhone className="me-1" />;
  };

  // Stats data
  const stats = [
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: <HiOutlineUserGroup size={24} />,
      color: "primary",
      bgColor: "primary-bg"
    },
    {
      title: "Booked",
      value: appointments.filter(a => a.status === "booked").length,
      icon: <HiOutlineCalendar size={24} />,
      color: "success",
      bgColor: "success-bg"
    },
    {
      title: "Pending",
      value: appointments.filter(a => a.status === "pending").length,
      icon: <BsClock size={24} />,
      color: "warning",
      bgColor: "warning-bg"
    },
    {
      title: "Cancelled",
      value: appointments.filter(a => a.status === "cancelled").length,
      icon: <HiOutlineCalendar size={24} />,
      color: "danger",
      bgColor: "danger-bg"
    }
  ];

  return (
    <Container fluid className="appointments-container">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Appointments</h1>
            <p className="page-subtitle">Manage and view all patient appointments</p>
          </div>
          <div className="header-badge">
            <span>Total: {loading ? "..." : appointments.length}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="stats-row">
        {stats.map((stat, index) => (
          <Col xl={3} lg={4} md={6} key={index} className="mb-4">
            <Card className={`stat-card ${stat.bgColor}`}>
              <Card.Body>
                <div className="stat-content">
                  <div className={`stat-icon ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-value">{loading ? "..." : stat.value}</h3>
                    <p className="stat-title">{stat.title}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search and Filter Section */}
      <Card className="search-card">
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={6} lg={5}>
              <InputGroup className="search-input-group">
                <InputGroup.Text>
                  <FaSearch className="search-icon" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search appointments by patient, doctor, mode, status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </InputGroup>
            </Col>
            <Col md={4} lg={4}>
              <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="booked">Booked</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Col>
            <Col md={2} lg={3} className="text-md-end">
              <div className="results-count">
                <span>Showing: {loading ? "..." : filteredAppointments.length} results</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loader */}
      {loading ? (
        <Card className="loading-card">
          <Card.Body className="loading-content">
            <Spinner animation="border" className="loading-spinner" />
            <h5>Loading appointments...</h5>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card className="table-card d-none d-lg-block">
            <Card.Body className="table-card-body">
              <div className="table-responsive">
                <Table hover className="appointments-table">
                  <thead>
                    <tr>
                      <th className="patient-col">Patient</th>
                      <th className="doctor-col">Doctor</th>
                      <th className="datetime-col">Date & Time</th>
                      <th className="mode-col">Mode</th>
                      <th className="fee-col">Fee</th>
                      <th className="status-col">Status</th>
                      <th className="action-col text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appt) => (
                        <tr key={appt._id} className="appointment-row">
                          <td className="patient-cell">
                            <div className="user-info">
                              <div className="avatar patient-avatar">
                                <FaUserInjured />
                              </div>
                              <div className="user-details">
                                <h6 className="user-name">{appt.userId?.full_name || "N/A"}</h6>
                                <span className="user-contact">{appt.userId?.phone_number || "N/A"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="doctor-cell">
                            <div className="user-info">
                              <div className="avatar doctor-avatar">
                                <FaUserMd />
                              </div>
                              <div className="user-details">
                                <h6 className="user-name">{appt.doctorId?.name || "N/A"}</h6>
                                <span className="user-speciality">{appt.doctorId?.speciality || "N/A"}</span>
                              </div>
                            </div>
                          </td>
                          <td className="datetime-cell">
                            <div className="datetime-info">
                              <div className="date-item">
                                <HiOutlineCalendar className="icon" />
                                <span className="date-text">
                                  {new Date(appt.date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="time-item">
                                <BsClock className="icon" />
                                <span className="time-text">{appt.time}</span>
                              </div>
                            </div>
                          </td>
                          <td className="mode-cell">
                            <Badge className={`mode-badge ${appt.type}`}>
                              {getConsultModeIcon(appt.type)}
                              {appt.type}
                            </Badge>
                          </td>
                          <td className="fee-cell">
                            <div className="fee-amount">
                              <FaRupeeSign className="currency-icon" />
                              <span>{appt.amount}</span>
                            </div>
                          </td>
                          <td className="status-cell">
                            <Badge 
                              className={`status-badge ${appt.status}`}
                            >
                              {appt.status}
                            </Badge>
                          </td>
                          <td className="action-cell text-center">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewDetails(appt._id)}
                              className="view-btn"
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data-cell">
                          <div className="no-data-content">
                            <HiOutlineCalendar className="no-data-icon" />
                            <h5>No appointments found</h5>
                            <p>Try adjusting your search criteria</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Mobile Cards */}
          <div className="mobile-cards d-block d-lg-none">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt) => (
                <Card key={appt._id} className="mobile-appointment-card">
                  <Card.Body>
                    <div className="mobile-card-header">
                      <div className="mobile-user-info">
                        <div className="avatar patient-avatar">
                          <FaUserInjured />
                        </div>
                        <div className="mobile-user-details">
                          <h6 className="user-name">{appt.userId?.full_name || "N/A"}</h6>
                          <span className="user-contact">{appt.userId?.phone_number || "N/A"}</span>
                        </div>
                      </div>
                      <Badge className={`status-badge mobile ${appt.status}`}>
                        {appt.status}
                      </Badge>
                    </div>

                    <div className="mobile-doctor-info">
                      <div className="mobile-user-info">
                        <div className="avatar doctor-avatar">
                          <FaUserMd />
                        </div>
                        <div className="mobile-user-details">
                          <h6 className="user-name">{appt.doctorId?.name || "N/A"}</h6>
                          <span className="user-speciality">{appt.doctorId?.speciality || "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    <Row className="mobile-details-row">
                      <Col xs={4}>
                        <div className="mobile-detail-item">
                          <HiOutlineCalendar className="detail-icon" />
                          <small className="detail-label">Date</small>
                          <span className="detail-value">
                            {new Date(appt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div className="mobile-detail-item">
                          <BsClock className="detail-icon" />
                          <small className="detail-label">Time</small>
                          <span className="detail-value">{appt.time}</span>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div className="mobile-detail-item">
                          <FaRupeeSign className="detail-icon" />
                          <small className="detail-label">Fee</small>
                          <span className="detail-value">{appt.amount}</span>
                        </div>
                      </Col>
                    </Row>

                    <div className="mobile-card-footer">
                      <Badge className={`mode-badge mobile ${appt.type}`}>
                        {getConsultModeIcon(appt.type)}
                        {appt.type}
                      </Badge>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewDetails(appt._id)}
                        className="mobile-view-btn"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <Card className="no-data-card">
                <Card.Body className="no-data-content">
                  <HiOutlineCalendar className="no-data-icon" />
                  <h5>No appointments found</h5>
                  <p>Try adjusting your search criteria</p>
                </Card.Body>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Appointment Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="details-modal">
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Appointment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {modalLoading || !selectedAppointment ? (
            <div className="modal-loading">
              <Spinner animation="border" className="loading-spinner" />
              <p>Loading details...</p>
            </div>
          ) : (
            <>
              <Row className="g-4">
                <Col md={6}>
                  <Card className="info-card patient-card">
                    <Card.Body>
                      <div className="info-header">
                        <div className="info-avatar patient">
                          <FaUserInjured />
                        </div>
                        <h6>Patient Information</h6>
                      </div>
                      <div className="info-content">
                        <div className="info-item">
                          <strong>Name:</strong> {selectedAppointment.userId?.full_name}
                        </div>
                        <div className="info-item">
                          <strong>Email:</strong> {selectedAppointment.userId?.email}
                        </div>
                        <div className="info-item">
                          <strong>Phone:</strong> {selectedAppointment.userId?.phone_number}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="info-card doctor-card">
                    <Card.Body>
                      <div className="info-header">
                        <div className="info-avatar doctor">
                          <FaUserMd />
                        </div>
                        <h6>Doctor Information</h6>
                      </div>
                      <div className="info-content">
                        <div className="info-item">
                          <strong>Name:</strong> {selectedAppointment.doctorId?.name}
                        </div>
                        <div className="info-item">
                          <strong>Email:</strong> {selectedAppointment.doctorId?.email}
                        </div>
                        <div className="info-item">
                          <strong>Phone:</strong> {selectedAppointment.doctorId?.mobile}
                        </div>
                        <div className="info-item">
                          <strong>Speciality:</strong> {selectedAppointment.doctorId?.speciality}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="info-card appointment-details-card mt-4">
                <Card.Body>
                  <h6 className="info-section-title">Appointment Details</h6>
                  <Row className="g-3">
                    <Col sm={6}>
                      <div className="detail-item">
                        <strong>Consult Mode:</strong>
                        <Badge className={`mode-badge ${selectedAppointment.type}`}>
                          {getConsultModeIcon(selectedAppointment.type)}
                          {selectedAppointment.type}
                        </Badge>
                      </div>
                      <div className="detail-item">
                        <strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}
                      </div>
                      <div className="detail-item">
                        <strong>Time:</strong> {selectedAppointment.time}
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="detail-item">
                        <strong>Status:</strong> 
                        <Badge className={`status-badge ${selectedAppointment.status}`}>
                          {selectedAppointment.status}
                        </Badge>
                      </div>
                      <div className="detail-item">
                        <strong>Amount:</strong> ₹{selectedAppointment.amount}
                      </div>
                      <div className="detail-item">
                        <strong>Razorpay Order ID:</strong> {selectedAppointment.razorpayOrderId || "N/A"}
                      </div>
                      <div className="detail-item">
                        <strong>Jitsi Link:</strong> 
                        {selectedAppointment.jitsiLink ? (
                          <a href={selectedAppointment.jitsiLink} target="_blank" rel="noopener noreferrer" className="meeting-link">
                            Join Meeting
                          </a>
                        ) : (
                          " N/A"
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button variant="primary" onClick={() => setShowModal(false)} className="close-btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Appointments;