const generateToken = require("../utils/generateToken");
const Admin = require("../models/Admin");
const Doctor = require("../models/doctor");
const User = require("../models/User"); // make sure you create this model
const VerifiedDoctor = require("../models/VerifiedDoctor");
const { addTokenToBlacklist } = require("../utils/tokenBlacklist");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const { sendEmailByMailSender } = require("../utils/sendEmail");
const Appointment = require("../models/Appointment");

// REGISTER
const registerAdmin = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { username, mobileNo, email, password } = req.body;

    if (!username || !mobileNo || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({
      username,
      mobileNo,
      email,
      password,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      token: generateToken(admin._id, "admin"),
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(admin._id, "admin"),
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout Admin
const logoutAdmin = async (req, res) => {
  try {
    let token = req.headers["authorization"];
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }
    token = token.split(" ")[1];

    addTokenToBlacklist(token);
    res.json({ message: "Logout successful. Token is now invalid." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ======================== USER MANAGEMENT ========================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const totalUsers = await User.countDocuments(); // total number of users

    res.status(200).json({
      totalUsers, // total count
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//======================== DOCTOR MANAGEMENT ========================

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const totalDoctors = await Doctor.countDocuments(); // total number of doctors

    res.status(200).json({
      totalDoctors, // total count
      doctors,
    });
  } catch (error) {
    console.error("Get all doctors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};









const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ doctor });
  } catch (error) {
    console.error("Get doctor by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Doctor.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    res.status(500).json({ message: "Server error" });
  }
};





// verify doctor
const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (doctor.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Doctor already verified",
      });
    }

    const username = doctor.email || doctor.mobile;
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    doctor.isApproved = true;
    doctor.username = username;
    doctor.password = hashedPassword;
    await doctor.save();

    // ✅ SAVE VERIFIED DOCTOR (SAFE)
    try {
      await VerifiedDoctor.create({
        doctorId: doctor._id,
        name: doctor.name,
        email: doctor.email,
        mobile: doctor.mobile,
        username,
        password: hashedPassword,
      });
    } catch (e) {
      console.error("VerifiedDoctor save failed:", e.message);
    }

    // ✅ EMAIL (NON-BLOCKING)
    if (doctor.email) {
      sendEmailByMailSender({
        email: doctor.email,
        subject: "Doctor Account Verified",
        message: `
          <h2>Hello Dr. ${doctor.name}</h2>
          <p>Username: ${username}</p>
          <p>Password: ${randomPassword}</p>
        `,
      }).catch(err => {
        console.error("EMAIL ERROR:", err.message);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor verified successfully",
    });

  } catch (error) {
    console.error("VERIFY DOCTOR CRASH:", error);
    return res.status(500).json({ message: "Server error" });
  }
};






// // Get all verified doctors from VerifiedDoctor collection
const getAllVerifiedDoctors = async (req, res) => {
  try {
    const verifiedDoctors = await VerifiedDoctor.find({});
    res.status(200).json({
      success: true,
      count: verifiedDoctors.length,
      data: verifiedDoctors,
    });
  } catch (error) {
    console.error("Error fetching verified doctors:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verified doctors",
      error: error.message,
    });
  }
};



// ======================== REVIEWS ========================
const giveDoctorReview = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { rating, comment } = req.body;
    const adminId = req.admin?._id;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const newReview = {
      adminId,
      rating,
      comment: comment || "",
      createdAt: new Date(),
    };

    doctor.reviews.push(newReview);
    await doctor.save();

    admin.givenRatings.push({ doctorId, rating, comment });
    await admin.save();

    res.status(201).json({
      message: "Review added successfully",
      doctorAverage: doctor.averageRating,
      doctorReviews: doctor.reviews,
      adminRatings: admin.givenRatings,
    });
  } catch (error) {
    console.error("Error adding doctor review:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// ===================== ADMIN APPOINTMENT MANAGEMENT =====================

// Get All Appointments (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId", "full_name email phone_number")
      .populate("doctorId", "name speciality email mobile");

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    }

    res.status(200).json({
      success: true,
      totalAppointments: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get All Appointments Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Appointments by User ID
const getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await Appointment.find({ userId })
      .populate("doctorId", "name speciality email mobile")
      .populate("userId", "full_name email phone_number");

    if (!appointments || appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for this user" });
    }

    res.status(200).json({
      success: true,
      totalAppointments: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get Appointments by User Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Appointments by Doctor ID
const getAppointmentsByDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Appointment.find({ doctorId })
      .populate("doctorId", "name speciality email mobile")
      .populate("userId", "full_name email phone_number");

    if (!appointments || appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No appointments found for this doctor" });
    }

    res.status(200).json({
      success: true,
      totalAppointments: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get Appointments by Doctor Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get Appointment Details by ID
const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId)
      .populate("doctorId", "name speciality email mobile")
      .populate("userId", "full_name email phone_number");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Get Appointment Details Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllDoctors,
  getDoctorById,
  deleteDoctor,
  verifyDoctor,
  getAllVerifiedDoctors,
  giveDoctorReview,
  getAllAppointments,
  getAppointmentsByUser,
  getAppointmentsByDoctor,
  getAppointmentDetails,
};
