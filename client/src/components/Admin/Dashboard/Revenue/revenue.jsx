import React, { useEffect, useState } from "react";
import { Container, Card, Spinner } from "react-bootstrap";
import { MdCurrencyRupee } from "react-icons/md";
import axios from "axios";
import { API_BASE_URL } from "../../../../api-config";
const Revenue = () => {
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchRevenue = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRevenue(res.data.totalRevenue || 0);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch revenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, [token]);

  return (
    <Container className="mt-4">
      <Card className="text-center shadow-sm border-0 p-3">
        <Card.Body>
          <MdCurrencyRupee size={40} color="#198754" className="mb-2" />
          <Card.Title className="fw-bold">
            {loading ? <Spinner animation="border" size="sm" /> : error ? "Error" : `₹${revenue.toLocaleString()}`}
          </Card.Title>
          <Card.Text>Total Revenue</Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Revenue;
