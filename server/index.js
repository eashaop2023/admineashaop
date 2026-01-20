
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

/* ================= MIDDLEWARES ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://admin.eashaop.com",
      "https://www.admin.eashaop.com",
      "https://e-ashaop-git-apiauthtoken-eashas-projects-ea375452.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

/* ================= DATABASE ================= */
connectDB();

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.json({ message: "Healthcare API running..." });
});

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

/* ================= SERVER ================= */
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});
