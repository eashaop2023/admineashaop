const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "https://admin.eashaop.com", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ servicename: "first app module" });
});

// Connect DB
connectDB();

// Mount routes
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

// Test root
app.get("/", (req, res) => {
  res.send("Healthcare API running...");
});

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
