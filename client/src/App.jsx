// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Admin from "./components/Admin/Admin";
import Login from "./components/Login/Login"; // <-- create a simple login page

function App() {
  return (
    <Router>
      <Routes>
        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Admin handles all nested routes */}
        <Route path="/*" element={<Admin />} />

        {/* Redirect unknown routes to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
