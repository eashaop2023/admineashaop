const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userId: { type: String },
    full_name: { type: String, required: true, trim: true, minlength: 3 },
    phone_number: {
      type: String,
      required: true,
      unique: true,
      set: (v) => {
        const digits = v.replace(/\D/g, "");
        // Always store in +91XXXXXXXXXX format
        if (digits.length === 10) return `+91${digits}`;
        if (digits.length === 12 && digits.startsWith("91"))
          return `+${digits}`;
        return v;
      },
      validate: {
        validator: function (v) {
          // The validator now checks for the final, normalized format.
          return /^\+91[6-9]\d{9}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value < today;
        },
        message: "Date of Birth must be before today.",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "intersex", "other"],
      set: (v) => v.toLowerCase(),
    },
    password: { type: String, required: true },
    profileImage: { cloudinaryUrl: String, localPath: String },
    aadhaar_number: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^\d{12}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid Aadhaar number!`,
      },
    },
    appointments: [
      {
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
        type: { type: String },
        date: { type: Date },
        time: { type: String },
        jitsiLink: { type: String, default: null },
        dependent: {
          fullName: String,
          dob: Date,
          mobile: String,
          email: String,
          gender: String,
          relation: String,
          address: String,
          pincode: String,
        },
        status: { type: String },
      },
    ],

    address: { type: String, trim: true, minlength: 10 },
    language_preferred: { type: String, trim: true },
    height: { type: Number, min: 30, max: 300 },
    weight: { type: Number, min: 2, max: 500 },
    health_conditions: { type: [String], default: [] },
    otp_verified: { type: Boolean, default: false },
    registration_otp: { code: String, expires: Date },
    forgot_password_otp: {
      code: String,
      expires: Date,
      verified: { type: Boolean, default: false },
    },
    login_otp: {
      code: String,
      expires: Date,
      verified: { type: Boolean, default: false },
    },
    request_id: { type: String },
    status: { type: Boolean, default: false },
    tokens: { type: [String], default: [] },
    email: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    documents: [
      {
        public_id: String,
        url: String,
        format: String,
        fileName: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to hash password
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password") && !this.password.startsWith("$2a$")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });
userSchema.pre("save", async function (next) {
  // Regex: matches $2a$, $2b$, or $2y$
  const bcryptPrefix = /^\$2[aby]\$/;

  if (this.isModified("password") && !bcryptPrefix.test(this.password)) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
