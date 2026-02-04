// models/Doctor.js
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  speciality: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  isApproved: {
    type: Boolean,
    default: false,
  },
  username: { type: String }, 
  password: { type: String },
  isVerified: { type: Boolean, default: false },
  setupToken: { type: String },
  setupTokenExpires: { type: Date },
  reviews: [
    {
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 },
});

doctorSchema.pre("save", function (next) {
  if (this.reviews.length > 0) {
    this.averageRating =
      this.reviews.reduce((sum, review) => sum + review.rating, 0) /
      this.reviews.length;
  } else {
    this.averageRating = 0;
  }
  next();
});

module.exports = mongoose.model("Doctor", doctorSchema);
