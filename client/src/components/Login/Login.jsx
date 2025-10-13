import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import logo from "../../assets/eashalogo.png";
import { API_BASE_URL } from "../../api-config";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/login`,
        { 
          email: identifier,
          password: password,
          withCredentials: true
        }
      );

      // ✅ Save token and admin info in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("admin", JSON.stringify(response.data.admin));

      // Navigate to admin dashboard or ManageDoctors page
      navigate("/dashboard");
    } catch (err) {
      // console.error(err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Invalid Email or Password");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div
        className="card shadow p-4"
        style={{ width: "400px", borderRadius: "28px" }}
        autoComplete="off"
      >
        <div className="text-center mb-4">
          <img src={logo} alt="Logo" style={{ width: "120px" }} />
        </div>

        <h4 className="text-center mb-3">Login</h4>

        {error && (
          <div
            className="alert alert-danger py-2 text-center"
            style={{ borderRadius: "28px" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={{ borderRadius: "28px" }}
              autoComplete="off"
            />
          </div>

          <div className="mb-3 position-relative">
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ borderRadius: "28px" }}
              autoComplete="new-password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "70%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#555",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{ borderRadius: "28px" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
