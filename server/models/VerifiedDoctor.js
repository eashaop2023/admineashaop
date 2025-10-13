const mongoose = require("mongoose");

const verifiedDoctorSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  name: { type: String, required: true },
  email: { type: String },
  mobile: { type: String },
  username: { type: String, required: true },
  password: { type: String, required: true }, // hashed password
  verifiedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VerifiedDoctor", verifiedDoctorSchema);
