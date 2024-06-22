const express = require("express");
const authenticate = require("../middleware/verifyToken");
const { isTwoFactorEnabled, updateAvatar, changePassword } = require("../controller/profileController");
const upload = require("../helpers/upload");

const ProfileRouter = express.Router();

ProfileRouter.post("/istwofactorenabled", authenticate,isTwoFactorEnabled)
ProfileRouter.post('/update-avatar', authenticate, upload.single('avatar'), updateAvatar);
ProfileRouter.post("/change-password", authenticate, changePassword)


module.exports = ProfileRouter;