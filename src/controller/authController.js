const sendMail = require("../utils/sendMail");
const { generateAccessToken, generateRefreshToken } = require("../utils/generate-token");
const userModel = require("../model/userModel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const userExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (userExist) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new userModel({ username, password, email });
    newUser.emailVerification();

    await newUser.save();

    const emailText = `Please click the following link to verify your email: 
      ${process.env.CLIENT_URL}/verify-email?token=${newUser.emailVerificationToken}`;
    await sendMail(newUser.email, "Please verify your email", emailText);

    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await userModel.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid token." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password or email" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Account is not verified. Please verify your account before logging in." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...otherDetails } = user._doc;

    res.status(200).json({
      message: 'Login successfully',
      user: { ...otherDetails },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '1h' });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const emailText = `Please click the following link to reset your password: \n\n ${resetUrl}`;

    await sendMail(user.email, "Password Reset", emailText);

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const user = await userModel.findOne({ _id: decodedToken.userId });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password has been reset." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout
};
