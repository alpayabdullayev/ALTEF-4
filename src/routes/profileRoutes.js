const express = require("express");
const authenticate = require("../middleware/verifyToken");
const { isTwoFactorEnabled } = require("../controller/profileController");

const ProfileRouter = express.Router();

ProfileRouter.post("/istwofactorenabled", authenticate,isTwoFactorEnabled)


module.exports = ProfileRouter;