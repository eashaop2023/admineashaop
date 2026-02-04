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
const crypto = require("crypto");

// Register Admin
const registerAdmin = async (req, res) => {
  const { username, mobileNo, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ username, mobileNo, email, password });
    res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(admin._id, "admin");

    res.status(200).json({
      message: "Login successful",
      token,
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

// ======================== DOCTOR MANAGEMENT ========================

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








const verifyDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.isApproved) {
      return res.status(200).json({
        success: true,
        message: "Doctor already verified",
      });
    }

    const username = doctor.email || doctor.mobile;
    
    // Generate secure setup token
    const setupToken = crypto.randomBytes(32).toString("hex");
    const setupTokenExpires = new Date();
    setupTokenExpires.setDate(setupTokenExpires.getDate() + 7); // Token expires in 7 days

    doctor.isApproved = true;
    doctor.isVerified = true;
    doctor.username = username;
    doctor.setupToken = setupToken;
    doctor.setupTokenExpires = setupTokenExpires;
    // Don't set password yet - doctor will set it via the link
    await doctor.save();

    // ✅ SEND SUCCESS RESPONSE IMMEDIATELY
    res.status(200).json({
      success: true,
      message: "Doctor verified successfully",
    });

    // 📧 EMAIL (NON-BLOCKING)
    if (doctor.email) {
      // Get frontend URL from environment or use default
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
      const setupLink = `${frontendUrl}/doctor/setup-password?token=${setupToken}`;

      sendEmailByMailSender({
        email: doctor.email,
        subject: "Doctor Account Verified - Set Your Password",
        message: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #2c3e50;">Hello Dr. ${doctor.name}</h2>
            <p>Your account has been <strong>verified and approved</strong> by the admin.</p>
            <p>To complete your registration, please set your password by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupLink}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Set Your Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 12px; word-break: break-all;">${setupLink}</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              <strong>Note:</strong> This link will expire in 7 days. If you didn't request this, please ignore this email.
            </p>
            <p style="margin-top: 30px;">Thank you,<br/><strong>eAshaop 24/7 Team</strong></p>
          </div>
        `,
      }).catch(err => {
        console.error("Email failed:", err.message);
      });
    }

  } catch (error) {
    console.error("Verify doctor error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};






















// const verifyDoctor = async (req, res) => {
//   const doctorId = req.params.id;

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ message: "Doctor not found" });
//     }

//     if (doctor.isApproved) {
//       return res.json({ message: "Doctor already verified" });
//     }

//     //  Create credentials
//     const username = doctor.email || doctor.mobile;
//     const randomPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = await bcrypt.hash(randomPassword, 10);

//     //  Update doctor
//     doctor.isApproved = true;
//     doctor.isVerified = true;
//     doctor.username = username;
//     doctor.password = hashedPassword;

//     await doctor.save();

//     //  Save VerifiedDoctor (DO NOT block main flow)
//     const exists = await VerifiedDoctor.findOne({ doctorId: doctor._id });
//     if (!exists) {
//       await VerifiedDoctor.create({
//         doctorId: doctor._id,
//         name: doctor.name,
//         email: doctor.email,
//         mobile: doctor.mobile,
//         username,
//         password: hashedPassword,
//       });
//     }

//     //  Send email safely (NON-BLOCKING)
//     if (doctor.email) {
//       sendEmailByMailSender({
//         email: doctor.email,
//         subject: "Doctor Account Verified – Login Credentials",
//         message: `
//           <h2>Hello Dr. ${doctor.name}</h2>
//           <p>Your account has been <b>verified</b>.</p>
//           <p><b>Username:</b> ${username}</p>
//           <p><b>Password:</b> ${randomPassword}</p>
//           <p>Please change your password after login.</p>
//         `,
//       }).catch((err) => {
//         console.error("⚠️ Email failed but verification succeeded:", err);
//       });
//     }

//     //  ALWAYS SUCCESS RESPONSE
//     return res.json({
//       success: true,
//       message: "Doctor verified successfully",
//     });

//   } catch (error) {
//     console.error("Verify doctor error:", error);
//     return res.status(500).json({ message: "Verification failed" });
//   }
// };























// // Verify the Doctor
// const verifyDoctor = async (req, res) => {
//   const doctorId = req.params.id;

//   try {
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });

//     if (doctor.isVerified && doctor.isApproved)
//       return res
//         .status(200)
//         .json({ message: "Doctor is already verified and approved." });

//     const username = doctor.email || doctor.mobile;
//     const randomPassword = Math.random().toString(36).slice(-8);
//     const hashedPassword = await bcrypt.hash(randomPassword, 10);

//     // Update doctor document
//     doctor.isVerified = true;
//     doctor.isApproved = true;
//     doctor.username = username;
//     doctor.password = hashedPassword;

//     // Create or update VerifiedDoctor entry
//     const verifiedDoctorPromise = VerifiedDoctor.findOne({ doctorId: doctor._id })
//       .then((existing) => {
//         if (!existing) {
//           return new VerifiedDoctor({
//             doctorId: doctor._id,
//             name: doctor.name,
//             email: doctor.email,
//             mobile: doctor.mobile,
//             username,
//             password: hashedPassword,
//           }).save();
//         }
//       });

//     await Promise.all([doctor.save(), verifiedDoctorPromise]);


//     if (doctor.email) {
//       const subject = "Your Doctor Portal Login Credentials";

//       // ✨ HTML Email Template
//       const message = `
//         <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px;">
//           <h2 style="color:#2c3e50;">Welcome to the Doctor Portal, Dear. ${doctor.name}</h2>
//           <p>Your account has been <strong>verified and approved</strong>.</p>
//           <p>You can now log in using the following credentials:</p>
//           <div style="background:#f9f9f9;padding:15px;border-radius:6px;margin-top:10px;margin-bottom:20px;">
//             <p><strong>Username:</strong> ${username}</p>
//             <p><strong>Password:</strong> ${randomPassword}</p>
//           </div>
//           <p>Please log in and <strong>change your password</strong> after first login.</p>
//           <p>Thank you,<br/><strong>eAshaop 24/7 Team</strong></p>
//         </div>
//       `;

//       await sendEmailByMailSender({
//         email: doctor.email,
//         subject,
//         message,
//       });
//     }

//     res.json({
//       success: true,
//       message: "Doctor verified and approved successfully.",
//     });
//   } catch (error) {
//     console.error(" Error verifying doctor:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// Get all verified doctors from VerifiedDoctor collection
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

// Verify Doctor Setup Token (Public endpoint - no auth required)
const verifyDoctorSetupToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: "Token is required" 
      });
    }

    // Find doctor by setup token
    const doctor = await Doctor.findOne({ 
      setupToken: token,
      setupTokenExpires: { $gt: new Date() } // Token not expired
    });

    if (!doctor) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired token" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      doctor: {
        name: doctor.name,
        email: doctor.email,
      },
    });

  } catch (error) {
    console.error("Verify doctor setup token error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Set Doctor Password (Public endpoint - no auth required)
const setDoctorPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Token and password are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 6 characters long" 
      });
    }

    // Find doctor by setup token
    const doctor = await Doctor.findOne({ 
      setupToken: token,
      setupTokenExpires: { $gt: new Date() } // Token not expired
    });

    if (!doctor) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or expired token. Please contact admin for a new setup link." 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update doctor with password and clear setup token
    doctor.password = hashedPassword;
    doctor.setupToken = undefined;
    doctor.setupTokenExpires = undefined;
    await doctor.save();

    // Update or create VerifiedDoctor entry
    const verifiedDoctor = await VerifiedDoctor.findOne({ doctorId: doctor._id });
    if (verifiedDoctor) {
      verifiedDoctor.password = hashedPassword;
      await verifiedDoctor.save();
    } else {
      await VerifiedDoctor.create({
        doctorId: doctor._id,
        name: doctor.name,
        email: doctor.email,
        mobile: doctor.mobile,
        username: doctor.username,
        password: hashedPassword,
      });
    }

    res.status(200).json({
      success: true,
      message: "Password set successfully. You can now login with your credentials.",
    });

  } catch (error) {
    console.error("Set doctor password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
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
  verifyDoctorSetupToken,
  setDoctorPassword,
};
