// src/models/Admin.js
// Mongoose schema for an Admin document.

const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: [true, "Admin ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
