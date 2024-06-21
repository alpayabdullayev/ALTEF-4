const express = require("express");
const { register, verifyEmail, login, resetPassword, forgotPassword, logout, refreshToken, verifyOTP } = require("../controller/authController");
const { registerSchema, loginSchema, resetPasswordSchema } = require("../validations/auth-validations");
const validateRequest = require("../middleware/validateRequest");
const authenticate = require("../middleware/verifyToken");
const AuthRouter = express.Router();

AuthRouter.post("/register",validateRequest(registerSchema), register);
AuthRouter.get("/verify-email", verifyEmail);
AuthRouter.post("/login",validateRequest(loginSchema),login);
AuthRouter.post("/forgot-password",forgotPassword)
AuthRouter.post("/reset-password",validateRequest(resetPasswordSchema), resetPassword);
AuthRouter.post("/logout",logout)
AuthRouter.post("/refreshToken", refreshToken)
AuthRouter.post("/verify-otp", verifyOTP)

module.exports = AuthRouter;
