



import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Table, Button, Badge, Card, Form } from "react-bootstrap";
import { BsArrowLeft, BsSearch } from "react-icons/bs";
import "./ManageDoctors.css";

function CurrentView() {
  const location = useLocation();
  const navigate = useNavigate();

  const { doctors = [], title = "Filtered Results" } = location.state || {};

  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = doctors.filter((doc) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    return (
      doc.name?.toLowerCase().includes(term) ||
      doc.speciality?.toLowerCase().includes(term) ||
      doc.email?.toLowerCase().includes(term) ||
      String(doc.mobile || "").includes(term)
    );
  });

  return (
    <Container fluid className="manage-doctors-container mt-4">
      <Button
        variant="outline-danger"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <BsArrowLeft /> Back to Manage Doctors
      </Button>

      <Card className="content-card shadow-sm border-0">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0 text-danger">{title}</h4>
            <small className="text-muted">
              Based on your active search / filters
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Control
              type="text"
              size="sm"
              placeholder="Search doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <BsSearch className="text-muted" size={18} />
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="doctor-table mb-0">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialty</th>
                  <th>Contact</th>
                  <th>Hospital</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div className="fw-bold">{doc.name}</div>
                        <div className="small text-muted">{doc.email}</div>
                      </td>
                      <td>{doc.speciality}</td>
                      <td>{doc.mobile}</td>
                      <td>-</td>
                      <td>
                        <Badge bg={doc.isApproved ? "success" : "warning"}>
                          {doc.isApproved ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="text-muted">
                        No doctors match your search.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default CurrentView;
