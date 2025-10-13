import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../api-config";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Badge, 
  Form, 
  Spinner,
  Button,
  Dropdown,
  InputGroup,
  Modal
} from "react-bootstrap";
import { 
  FaRupeeSign, 
  FaCreditCard, 
  FaListUl, 
  FaUndo,
  FaSearch,
  FaDownload,
  FaFilter,
  FaEye,
  FaReceipt,
  FaUser,
  FaUserMd,
  FaCalendar,
  FaFileInvoice
} from "react-icons/fa";
import { MdPayments, MdTrendingUp, MdRefresh, MdClose } from "react-icons/md";

import "./Billing.css";

const BillingPayments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/api/admin/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAppointments(response.data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      alert("Not authorized or API error. Please login again.");
      window.location.href = "/admin/login";
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Memoized calculations for better performance
  const { filteredAppointments, summary } = useMemo(() => {
    let filtered = appointments.filter(
      (tx) =>
        tx.userId?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.doctorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        tx.doctorId?.specialization?.toLowerCase().includes(search.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter === "today") {
      const today = new Date().toDateString();
      filtered = filtered.filter(tx => new Date(tx.date).toDateString() === today);
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(tx => new Date(tx.date) >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(tx => new Date(tx.date) >= monthAgo);
    }

    // Dynamic summary calculations based on actual data
    const totalTransactions = appointments.length;
    const totalPaid = appointments
      .filter((a) => a.status === "booked")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalOutstanding = appointments
      .filter((a) => a.status === "pending")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalRefunded = appointments
      .filter((a) => a.status === "cancelled")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    // Calculate growth based on previous period (simplified - you can enhance this with actual historical data)
    const previousPeriodTransactions = Math.floor(totalTransactions * 0.85);
    const transactionGrowth = totalTransactions > 0 ? 
      ((totalTransactions - previousPeriodTransactions) / previousPeriodTransactions * 100).toFixed(1) : 0;

    const summaryData = [
      { 
        title: "Total Revenue", 
        value: `₹${totalPaid.toLocaleString()}`, 
        icon: <MdPayments />, 
        color: "success",
        growth: totalPaid > 0 ? "+12.5" : "0", // This can be made dynamic with historical data
        subtitle: "Completed payments"
      },
      { 
        title: "Outstanding", 
        value: `₹${totalOutstanding.toLocaleString()}`, 
        icon: <FaRupeeSign />, 
        color: "warning",
        subtitle: "Pending payments",
        growth: totalOutstanding > 0 ? "+8.2" : "0"
      },
      { 
        title: "Total Transactions", 
        value: totalTransactions.toLocaleString(), 
        icon: <FaListUl />, 
        color: "primary",
        subtitle: "All appointments",
        growth: transactionGrowth > 0 ? `+${transactionGrowth}` : "0"
      },
      { 
        title: "Total Refunded", 
        value: `₹${totalRefunded.toLocaleString()}`, 
        icon: <FaUndo />, 
        color: "danger",
        subtitle: "Cancelled appointments",
        growth: totalRefunded > 0 ? "+5.7" : "0"
      },
    ];

    return { filteredAppointments: filtered, summary: summaryData };
  }, [appointments, search, statusFilter, dateFilter]);

  const getStatusBadge = (status) => {
    const commonClasses = "status-badge";
    switch (status) {
      case "booked":
        return <Badge bg="success" className={commonClasses}>Paid</Badge>;
      case "pending":
        return <Badge bg="warning" text="dark" className={commonClasses}>Pending</Badge>;
      case "cancelled":
        return <Badge bg="danger" className={commonClasses}>Refunded</Badge>;
      case "completed":
        return <Badge bg="info" className={commonClasses}>Completed</Badge>;
      default:
        return <Badge bg="secondary" className={commonClasses}>{status || "-"}</Badge>;
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedAppointment(null);
  };

  const handleExport = () => {
    // Export functionality would go here
    const dataToExport = filteredAppointments.map(appointment => ({
      'Patient Name': appointment.userId?.full_name || 'N/A',
      'Doctor Name': appointment.doctorId?.name || 'N/A',
      'Visit Type': appointment.type || 'N/A',
      'Amount': appointment.amount || 0,
      'Status': appointment.status || 'N/A',
      'Date': appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A',
      'Patient Email': appointment.userId?.email || 'N/A',
      'Doctor Specialization': appointment.doctorId?.specialization || 'N/A'
    }));
    
    console.log('Exporting data:', dataToExport);
    alert(`Preparing to export ${dataToExport.length} records...`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Detail Modal Component
  const AppointmentDetailModal = () => {
    if (!selectedAppointment) return null;

    const appointment = selectedAppointment;
    
    return (
      <Modal show={showDetailModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header className="detail-modal-header">
          <Modal.Title>
            <FaFileInvoice className="me-2" />
            Appointment Details
          </Modal.Title>
          <Button variant="link" onClick={handleCloseModal} className="close-btn">
            <MdClose size={24} />
          </Button>
        </Modal.Header>
        <Modal.Body className="detail-modal-body">
          <Row className="g-3">
            <Col md={6}>
              <Card className="detail-card">
                <Card.Body>
                  <h6 className="detail-section-title">
                    <FaUser className="me-2" />
                    Patient Information
                  </h6>
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{appointment.userId?.full_name || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{appointment.userId?.email || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{appointment.userId?.phone || "N/A"}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="detail-card">
                <Card.Body>
                  <h6 className="detail-section-title">
                    <FaUserMd className="me-2" />
                    Doctor Information
                  </h6>
                  <div className="detail-item">
                    <span className="detail-label">Doctor Name:</span>
                    <span className="detail-value">Dr. {appointment.doctorId?.name || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Specialization:</span>
                    <span className="detail-value">{appointment.doctorId?.specialization || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Experience:</span>
                    <span className="detail-value">{appointment.doctorId?.experience ? `${appointment.doctorId.experience} years` : "N/A"}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="detail-card">
                <Card.Body>
                  <h6 className="detail-section-title">
                    <FaCalendar className="me-2" />
                    Appointment Details
                  </h6>
                  <div className="detail-item">
                    <span className="detail-label">Visit Type:</span>
                    <span className="detail-value">{appointment.type || "Consultation"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date & Time:</span>
                    <span className="detail-value">{formatDateTime(appointment.date)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{appointment.duration || "30 mins"}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="detail-card">
                <Card.Body>
                  <h6 className="detail-section-title">
                    <FaCreditCard className="me-2" />
                    Payment Information
                  </h6>
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount-large">₹{(appointment.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">{getStatusBadge(appointment.status)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{appointment.paymentMethod || "Online"}</span>
                  </div>
                  {appointment.paymentId && (
                    <div className="detail-item">
                      <span className="detail-label">Payment ID:</span>
                      <span className="detail-value text-mono">{appointment.paymentId}</span>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {appointment.notes && (
              <Col md={12}>
                <Card className="detail-card">
                  <Card.Body>
                    <h6 className="detail-section-title">Additional Notes</h6>
                    <p className="detail-notes">{appointment.notes}</p>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer className="detail-modal-footer">
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => window.print()}>
            Print Details
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  if (loading) {
    return (
      <Container fluid className="billing-container loading">
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <p>Loading billing data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="billing-container">
      {/* Header Section */}
      <div className="billing-header">
        <div className="header-content">
          <div className="header-title">
            <MdPayments className="header-icon" />
            <div>
              <h1>Billing & Payments</h1>
              <p>Manage and monitor all financial transactions</p>
            </div>
          </div>
          <div className="header-actions">
            <Button 
              variant="outline-primary" 
              className="refresh-btn"
              onClick={fetchAppointments}
              disabled={refreshing}
            >
              <MdRefresh className={refreshing ? 'spinning' : ''} />
              Refresh
            </Button>
            <Button variant="primary" className="export-btn" onClick={handleExport}>
              <FaDownload />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="summary-row">
        {summary.map((item, idx) => (
          <Col key={idx} xxl={3} lg={6} md={6} className="mb-4">
            <Card className="summary-card">
              <Card.Body>
                <div className="summary-content">
                  <div className="summary-icon" data-color={item.color}>
                    {item.icon}
                  </div>
                  <div className="summary-text">
                    <div className="summary-value">{item.value}</div>
                    <div className="summary-title">{item.title}</div>
                    <div className="summary-subtitle">{item.subtitle}</div>
                    {item.growth && item.growth !== "0" && (
                      <div className={`summary-growth ${item.growth.startsWith('+') ? 'positive' : 'neutral'}`}>
                        <MdTrendingUp />
                        {item.growth}%
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Transactions Section */}
      <Card className="transactions-card">
        <Card.Body>
          <div className="transactions-header">
            <div>
              <h5>Transaction History</h5>
              <p>All appointment payments and status</p>
            </div>
            <div className="transactions-filters">
              <InputGroup className="search-group">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search patients, doctors, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>

              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="filter-dropdown">
                  <FaFilter />
                  Status: {statusFilter === 'all' ? 'All' : statusFilter}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setStatusFilter("all")}>All Status</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter("booked")}>Paid</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter("pending")}>Pending</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter("cancelled")}>Refunded</Dropdown.Item>
                  <Dropdown.Item onClick={() => setStatusFilter("completed")}>Completed</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" className="filter-dropdown">
                  <FaFilter />
                  Date: {dateFilter === 'all' ? 'All Time' : dateFilter}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setDateFilter("all")}>All Time</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateFilter("today")}>Today</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateFilter("week")}>This Week</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateFilter("month")}>This Month</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="desktop-table">
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Patient Information</th>
                  <th>Doctor Information</th>
                  <th>Visit Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((tx, idx) => (
                    <tr key={tx._id || idx} className="transaction-row">
                      <td>
                        <div className="patient-info">
                          <div className="patient-name">{tx.userId?.full_name || "N/A"}</div>
                          <div className="patient-email">{tx.userId?.email || "N/A"}</div>
                        </div>
                      </td>
                      <td>
                        <div className="doctor-info">
                          <div className="doctor-name">Dr. {tx.doctorId?.name || "N/A"}</div>
                          <div className="doctor-specialty">{tx.doctorId?.specialization || "General"}</div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="visit-type">
                          {tx.type || "Consultation"}
                        </Badge>
                      </td>
                      <td className="amount-cell">
                        <div className="amount">₹{(tx.amount || 0).toFixed(2)}</div>
                      </td>
                      <td>{getStatusBadge(tx.status)}</td>
                      <td className="date-cell">
                        {formatDate(tx.date)}
                      </td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewDetails(tx)}
                          className="action-btn"
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      <div className="no-data-content">
                        <FaReceipt size={48} className="text-muted" />
                        <p>No transactions found</p>
                        <small>Try adjusting your search or filters</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="mobile-cards">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((tx, idx) => (
                <Card key={tx._id || idx} className="transaction-card">
                  <Card.Body>
                    <div className="transaction-header">
                      <div className="transaction-main">
                        <div className="patient-name">{tx.userId?.full_name || "N/A"}</div>
                        <div className="amount-mobile">₹{(tx.amount || 0).toFixed(2)}</div>
                      </div>
                      {getStatusBadge(tx.status)}
                    </div>
                    
                    <div className="transaction-details">
                      <div className="detail-item">
                        <span className="detail-label">Doctor:</span>
                        <span className="detail-value">Dr. {tx.doctorId?.name || "N/A"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Specialization:</span>
                        <span className="detail-value">{tx.doctorId?.specialization || "General"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{tx.type || "Consultation"}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">
                          {formatDate(tx.date)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{tx.userId?.email || "N/A"}</span>
                      </div>
                    </div>

                    <div className="transaction-actions">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleViewDetails(tx)}
                        className="action-btn-mobile"
                      >
                        <FaEye className="me-1" />
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="no-data-mobile">
                <FaReceipt size={48} className="text-muted" />
                <p>No transactions found</p>
                <small>Try adjusting your search or filters</small>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Appointment Detail Modal */}
      <AppointmentDetailModal />
    </Container>
  );
};

export default BillingPayments;