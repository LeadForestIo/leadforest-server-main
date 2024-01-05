// USER MODEL REQUIRES
const { Schema, model, Types } = require("mongoose");

// USER SCHEMA
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    uid: {
      // firebase given uid
      type: String,
      // unique: true,
      required: false,
    },
    profile: {
      type: String,
      required: true,
      default: "profile",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      required: true,
      default: "pending",
    },
    OTP: String,
    OTPExpiry: Date,
    stripeCustomerID: {
      type: String,
      required: true,
      unique: true,
    },
    selectedPlan: {
      type: String,
      enum: ["trial", "basic", "standard", "premium", "pro", "none"],
      required: true,
      default: "none",
    },
    credits: {
      type: Number,
      default: 0,
    },
    startDate: Date,
    endDate: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    extensionCode: {
      type: Types.ObjectId,
      // required: true,
      unique: true,
      trim: true,
      default: Types.ObjectId(),
    },
    scrapedData: [
      {
        type: Schema.Types.ObjectId,
        ref: "ScrapedData",
      },
    ],
  },
  {
    timestamps: true,
    collection: "leadforest_users",
  }
);

// USER MODEL
const User = model("User", userSchema);

// EXPORTS
module.exports = User;
