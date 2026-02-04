const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const verifyAdmin = require("../middlewares/verifyAdmin");
const Admin = require("../models/Admin");

// Auth routes
router.post("/register", adminController.registerAdmin);
router.post("/login", adminController.loginAdmin);
router.post("/logout", adminController.logoutAdmin);

// Public doctor password setup routes (no auth required)
router.get("/doctor/verify-setup-token", adminController.verifyDoctorSetupToken);
router.post("/doctor/setup-password", adminController.setDoctorPassword);

// User routes
router.get("/users", verifyAdmin(Admin), adminController.getAllUsers);
router.get("/users/:id", verifyAdmin(Admin), adminController.getUserById);
router.delete("/users/:id", verifyAdmin(Admin), adminController.deleteUser);

// Doctor routes
router.get("/doctors", verifyAdmin(Admin), adminController.getAllDoctors);
router.get("/doctors/:id", verifyAdmin(Admin), adminController.getDoctorById);
router.delete("/doctors/:id", verifyAdmin(Admin), adminController.deleteDoctor);

// Verify & fetch verified doctors
router.post("/doctors/:id/verify", verifyAdmin(Admin), adminController.verifyDoctor);
router.get("/verified-doctors", verifyAdmin(Admin), adminController.getAllVerifiedDoctors);

// Reviews
router.post("/doctor/:doctorId/review", verifyAdmin(Admin), adminController.giveDoctorReview);

// =================== APPOINTMENT MANAGEMENT ===================
router.get("/appointments", verifyAdmin(Admin), adminController.getAllAppointments);
router.get("/appointments/user/:userId", verifyAdmin(Admin), adminController.getAppointmentsByUser);
router.get("/appointments/doctor/:doctorId", verifyAdmin(Admin), adminController.getAppointmentsByDoctor);
router.get("/appointments/:appointmentId", verifyAdmin(Admin), adminController.getAppointmentDetails);


module.exports = router;
