const express = require("express");
const { register, verifyEmail, login, resetPassword, forgotPassword } = require("../controller/authController");
const { registerSchema, loginSchema, resetPasswordSchema } = require("../validations/auth-validations");
const validateRequest = require("../middleware/validateRequest");
const { validate } = require("../model/userModel");
const AuthRouter = express.Router();

AuthRouter.post("/register",validateRequest(registerSchema), register);
AuthRouter.get("/verify-email", verifyEmail);
AuthRouter.post("/login",validateRequest(loginSchema),login);
AuthRouter.post("/forgot-password",forgotPassword)
AuthRouter.post("/reset-password",validateRequest(resetPasswordSchema), resetPassword);

module.exports = AuthRouter;
