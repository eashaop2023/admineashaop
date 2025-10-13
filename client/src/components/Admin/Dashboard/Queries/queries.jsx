import React, { useState } from "react";
import { Container, Card, Table, Badge, Row, Col, InputGroup, Form } from "react-bootstrap";
import { FaComments, FaSearch } from "react-icons/fa";

const Queries = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const queries = [
    { name: "Anil", request: "Prescription Update", status: "Resolved" },
    { name: "Dr. Pavan", request: "Patient History", status: "Pending" },
    { name: "Bob Rohith", request: "Billing Issue", status: "Resolved" },
    { name: "Dr. Raghunath", request: "Appointment Schedule", status: "Pending" },
    { name: "Keerthi", request: "Lab Report", status: "Resolved" }
  ];

  const filteredQueries = queries.filter((query) =>
    Object.values(query).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Container className="mt-4">
      {/* Inline CSS for vertical layout on mobile */}
      <style>
        {`
          .vertical-table { display: none; }

          @media (max-width: 576px) {
            .horizontal-table { display: none; }
            .vertical-table { display: block; width: 100%; }

            .vertical-table table {
              width: 100%;
              table-layout: fixed;
              margin-bottom: 1.5rem;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              background: #fff;
            }

            .vertical-table td {
              padding: 8px 12px;
              border: 1px solid #dee2e6;
              word-wrap: break-word;
            }

            .vertical-table td:first-child {
              font-weight: 600;
              width: 40%;
              background: #f8f9fa;
            }

            .vertical-table td:last-child {
              width: 60%;
            }
          }
        `}
      </style>

      {/* Summary Card */}
      <Card className="text-center shadow-sm border-0 mb-4">
        <Card.Body>
          <FaComments size={40} color="#dc3545" className="mb-2" />
          <Card.Title className="fw-bold">{queries.length}</Card.Title>
          <Card.Text>Query Requests</Card.Text>
        </Card.Body>
      </Card>

      {/* Search bar */}
      <Row className="mb-3">
        <Col md={6} className="mx-auto">
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by name, request, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Normal horizontal table (desktop/tablet) */}
      <Card className="shadow-sm border-0 horizontal-table">
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Patient/Doctor Name</th>
                <th>Request For</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.length > 0 ? (
                filteredQueries.map((query, index) => (
                  <tr key={index}>
                    <td>{query.name}</td>
                    <td>{query.request}</td>
                    <td>
                      <Badge
                        bg={query.status === "Resolved" ? "success" : "warning"}
                        text={query.status === "Pending" ? "dark" : "light"}
                        style={{
                          minWidth: "100px",
                          display: "inline-block",
                          textAlign: "center",
                          padding: "8px 0"
                        }}
                      >
                        {query.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center text-muted">
                    No queries found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Vertical table (mobile only) */}
      <div className="vertical-table">
        {filteredQueries.length > 0 ? (
          filteredQueries.map((query, index) => (
            <table key={index}>
              <tbody>
                <tr>
                  <td>Patient/Doctor Name</td>
                  <td>{query.name}</td>
                </tr>
                <tr>
                  <td>Request For</td>
                  <td>{query.request}</td>
                </tr>
                <tr>
                  <td>Status</td>
                  <td>
                    <Badge
                      bg={query.status === "Resolved" ? "success" : "warning"}
                      text={query.status === "Pending" ? "dark" : "light"}
                      style={{
                        minWidth: "100px",
                        display: "inline-block",
                        textAlign: "center",
                        padding: "8px 0"
                      }}
                    >
                      {query.status}
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          ))
        ) : (
          <Card className="text-center shadow-sm border-0">
            <Card.Body className="text-muted">No queries found</Card.Body>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default Queries;
