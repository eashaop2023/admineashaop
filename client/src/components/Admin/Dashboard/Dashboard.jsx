import React, { useState, useEffect, useMemo } from "react";

import { API_BASE_URL } from "../../../api-config";
import {
  Container,
  Row,
  Col,
  Card,
  Dropdown,
  Spinner,
  Badge,
  ProgressBar,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineBell,
} from "react-icons/hi";
import {
  FaStethoscope,
  FaUser,
  FaMoneyBillWave,
  FaCalendarCheck,
} from "react-icons/fa";
import { MdDashboard, MdRefresh } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [selectedRange, setSelectedRange] = useState("Monthly");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchDashboardData();
  }, [token, selectedRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE_URL}/api/admin/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setDoctors(doctorsRes.data?.doctors || []);
      setPatients(patientsRes.data?.users || []);
      setAppointments(appointmentsRes.data?.appointments || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Memoized calculations for optimal performance
  const dashboardData = useMemo(() => {
    const totalRevenue = appointments
      .filter((a) => a.status === "booked")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const getAppointmentStatusCount = (status) => {
      return appointments.filter((a) => a.status === status).length;
    };

    // Chart data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    const chartData = monthNames.map((month, index) => {
      const monthRevenue = appointments
        .filter((a) => {
          const date = new Date(a.date);
          return date.getMonth() === index && 
                 date.getFullYear() === currentYear && 
                 a.status === "booked";
        })
        .reduce((sum, a) => sum + (a.amount || 0), 0);
      
      const monthAppointments = appointments.filter(
        (a) =>
          new Date(a.date).getMonth() === index &&
          new Date(a.date).getFullYear() === currentYear
      ).length;

      return { 
        name: month, 
        revenue: monthRevenue, 
        appointments: monthAppointments 
      };
    });

    // Doctor performance
    const doctorPerformance = Object.entries(
      appointments
        .filter((a) => a.status === "booked")
        .reduce((acc, a) => {
          const doc = a.doctorId?.name || "Unknown";
          acc[doc] = (acc[doc] || 0) + 1;
          return acc;
        }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, appointments]) => ({ name, appointments }));

    // Status distribution
    const statusData = [
      { name: "Booked", value: getAppointmentStatusCount("booked"), color: "#00A99D" },
      { name: "Pending", value: getAppointmentStatusCount("pending"), color: "#FFC107" },
      { name: "Cancelled", value: getAppointmentStatusCount("cancelled"), color: "#DC3545" },
      { name: "Completed", value: getAppointmentStatusCount("completed"), color: "#28A745" },
    ];

    // Recent appointments
    const recentAppointments = appointments
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return {
      totalRevenue,
      chartData,
      doctorPerformance,
      statusData,
      recentAppointments,
      getAppointmentStatusCount,
    };
  }, [appointments]);

  const GrowthIndicator = ({ value }) => {
    const isPositive = value >= 0;
    return (
      <div className={`growth-indicator ${isPositive ? "positive" : "negative"}`}>
        {isPositive ? <HiOutlineTrendingUp size={14} /> : <HiOutlineTrendingDown size={14} />}
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    color, 
    onClick,
    prefix = "",
    suffix = "",
  }) => (
    <Card className="stat-card" onClick={onClick}>
      <Card.Body>
        <div className="card-header">
          <div className="card-icon" style={{ backgroundColor: `${color}15`, color }}>
            <Icon size={24} />
          </div>
          <Dropdown>
            <Dropdown.Toggle variant="link" className="card-dropdown">
              <BsThreeDotsVertical size={16} className="text-muted" />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>View Details</Dropdown.Item>
              <Dropdown.Item>Export</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="card-content">
          <div className="card-value">
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                {prefix}{value}{suffix}
              </>
            )}
          </div>
          <p className="card-title">{title}</p>
          {!loading && growth !== undefined && <GrowthIndicator value={growth} />}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <MdDashboard size={28} className="text-primary" />
            <div>
              <h1>Dashboard Overview</h1>
              <p>Welcome back! Here's your performance summary</p>
            </div>
          </div>
          <div className="header-actions">
            <Button 
              variant="outline-primary" 
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <MdRefresh className={refreshing ? 'spinning' : ''} />
              Refresh
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" className="period-dropdown">
                <HiOutlineCalendar className="me-2" />
                {selectedRange}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setSelectedRange("Daily")}>Daily</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedRange("Weekly")}>Weekly</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedRange("Monthly")}>Monthly</Dropdown.Item>
                <Dropdown.Item onClick={() => setSelectedRange("Yearly")}>Yearly</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <Row className="metrics-row">
        <Col xxl={3} lg={6} md={6} className="mb-4">
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            growth={12.5}
            icon={HiOutlineUserGroup}
            color="#00A99D"
            onClick={() => navigate("/appointments")}
          />
        </Col>
        <Col xxl={3} lg={6} md={6} className="mb-4">
          <StatCard
            title="Total Revenue"
            value={dashboardData.totalRevenue.toLocaleString()}
            growth={8.3}
            icon={FaMoneyBillWave}
            color="#28A745"
            prefix="₹"
            onClick={() => navigate("/billing")}
          />
        </Col>
        <Col xxl={3} lg={6} md={6} className="mb-4">
          <StatCard
            title="Total Doctors"
            value={doctors.length}
            growth={5.2}
            icon={FaStethoscope}
            color="#17A2B8"
            onClick={() => navigate("/doctors")}
          />
        </Col>
        <Col xxl={3} lg={6} md={6} className="mb-4">
          <StatCard
            title="Total Patients"
            value={patients.length}
            growth={15.7}
            icon={FaUser}
            color="#FFC107"
            onClick={() => navigate("/patients")}
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="charts-row">
        <Col xl={8} lg={7} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <div className="chart-header">
                <div>
                  <h5>Revenue & Appointments</h5>
                  <p>Monthly performance overview</p>
                </div>
                <Badge bg="light" text="dark">
                  {new Date().getFullYear()}
                </Badge>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#6c757d', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#6c757d', fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => 
                        name === "revenue" ? [`₹${value.toLocaleString()}`, "Revenue"] : [value, "Appointments"]
                      }
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill="#28A745" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="appointments" 
                      name="Appointments" 
                      fill="#00A99D" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={4} lg={5} className="mb-4">
          <Card className="chart-card">
            <Card.Body>
              <div className="chart-header">
                <h5>Appointment Status</h5>
                <Badge bg="primary">{appointments.length}</Badge>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dashboardData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, "Appointments"]}
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend 
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{
                        paddingLeft: '20px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Section */}
      <Row className="bottom-row">
        <Col lg={6} className="mb-4">
          <Card className="data-card">
            <Card.Body>
              <div className="card-header">
                <h5>Recent Appointments</h5>
                <Button variant="link" size="sm" onClick={() => navigate("/appointments")}>
                  View All
                </Button>
              </div>
              <div className="data-list">
                {dashboardData.recentAppointments.map((appointment, index) => (
                  <div key={appointment._id || index} className="data-item">
                    <div className="item-info">
                      <div className="item-main">
                        {appointment.userId?.full_name || "Unknown Patient"}
                      </div>
                      <div className="item-meta">
                        <span>Dr. {appointment.doctorId?.name || "Unknown"}</span>
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge 
                      className="status-badge"
                      bg={
                        appointment.status === "booked" ? "success" :
                        appointment.status === "pending" ? "warning" :
                        appointment.status === "cancelled" ? "danger" : "info"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="data-card">
            <Card.Body>
              <div className="card-header">
                <h5>Top Doctors</h5>
                <Button variant="link" size="sm" onClick={() => navigate("/doctors")}>
                  View All
                </Button>
              </div>
              <div className="data-list">
                {dashboardData.doctorPerformance.map((doctor, index) => (
                  <div key={index} className="data-item">
                    <div className="item-info">
                      <div className="doctor-avatar">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="item-main">{doctor.name}</div>
                        <div className="item-meta">
                          {doctor.appointments} appointments
                        </div>
                      </div>
                    </div>
                    <div className="performance">
                      <ProgressBar 
                        now={(doctor.appointments / Math.max(...dashboardData.doctorPerformance.map(d => d.appointments))) * 100} 
                        variant="primary"
                        className="performance-bar"
                      />
                      <span className="performance-text">
                        {Math.round((doctor.appointments / Math.max(...dashboardData.doctorPerformance.map(d => d.appointments))) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;