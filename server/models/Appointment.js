const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ["video", "clinic"], required: true },
  status: { type: String, enum: ["pending", "booked", "cancelled", "completed"], default: "pending" },
  amount: { type: Number, required: true },  // <-- Amount in INR

  dependent: {
    fullName: String,
    dob: String,
    mobile: String,
    email: String,
    gender: { type: String, enum: ["male", "female", "others"] },
    relation: { type: String, enum: ["spouse", "son", "daughter", "father", "mother", "friend", "other"] },
    address: String,
    pincode: String
  },

  jitsiLink: { type: String, default: null },
  razorpayOrderId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema, "appointments");
