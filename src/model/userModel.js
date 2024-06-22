const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: { type: String, required: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    avatar: {
      type: String,
      trim: true,
      default:
        "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg",
    },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ALTEF4BLOG",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ALTEF4BLOG",
      },
    ],
    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ALTEF4BLOG",
      },
    ],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "ALTEF4USER" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "ALTEF4USER" }],
    isActive: { type: Boolean, default: true },
    isTwoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    twoFactorTempSecret: { type: String },
    twoFactorQRCodeURL: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.emailVerification = function () {
  this.emailVerificationToken = uuidv4();
  this.emailVerificationExpires = Date.now() + 3600000;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.checkPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("ALTEF4USER", userSchema);

module.exports = userModel;
