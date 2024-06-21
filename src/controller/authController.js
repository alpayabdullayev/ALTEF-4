const sendMail = require("../utils/sendMail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generate-token");
const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { cookieOptions } = require("../utils/cookieOptions");
const { sendOTP } = require("../utils/sendOTP");

const register = async (req, res,next) => {
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

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (err) {
    next(err)
  }

};

const verifyEmail = async (req, res,next) => {
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
  } catch (err) {
    next(err)
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password or email" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Account is not verified. Please verify your account before logging in.",
      });
    }

    if (user.isTwoFactorEnabled) {
      const otpToken = generateAccessToken(user, '10m'); 
      await sendOTP(user);
      return res.status(200).json({ message: "OTP sent to your email.", otpToken });
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
      message: "Login successfully",
      user: { ...otherDetails },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Access token missing" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await userModel.findById(decoded.userId);
    console.log("user otp", user.otp); 
    console.log("otppp" ,otp); 
    console.log("asdadw",user.otpExpires); 

    if (!user) return res.status(404).json({ message: "User not found" });

    if (otp !== user.otp) {
      console.log('Incorrect OTP provided');
      return res.status(400).json({ error: "Invalid OTP." });
    }

    if (user.otpExpires < Date.now()) {
      console.log('OTP has expired');
      return res.status(400).json({ error: "Expired OTP." });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
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

    const { password: _, ...otherDetails } = user._doc;

    res.status(200).json({
      message: "OTP verified successfully",
      user: { ...otherDetails },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res,next) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_PASSWORD_SECRET,
      { expiresIn: "1h" }
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const emailText = `Please click the following link to reset your password: \n\n ${resetUrl}`;

    await sendMail(user.email, "Password Reset", emailText);

    res.status(200).json({ message: "Password reset email sent." });
  } catch (err) {
    next(err)
  }
};

const resetPassword = async (req, res,next) => {
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
  } catch (err) {
    next(err)
  }
};

const logout = async (req, res,next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    next(err)
  }
};

const refreshToken = async (req, res,next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh Token is Missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN);
    } catch (error) {
      console.log(`Error in refreshToken: ${error.message}`);
      return res.status(401).json({ message: "Invalid or Expired Refresh Token" });
    }

    const findUser = await userModel.findById(decoded.userId);

    if (!findUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const accessToken = generateAccessToken(findUser);
    res.cookie("accessToken", accessToken, cookieOptions);

    res.status(200).json({ message: "Access Token refreshed successfully" });
  } catch (err) {
    next(err)
  }
};




module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
  verifyOTP
};
