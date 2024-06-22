const { streamUpload } = require("../helpers/cloudinaryHelper");
const userModel = require("../model/userModel");

const isTwoFactorEnabled = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();

    res
      .status(200)
      .json({ message: "isTwoFactorEnabled successfully", user: user });
  } catch (err) {
    next(err);
    res.status(500).json({ message: err.message });
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const result = await streamUpload(req.file.buffer);
    const imageUrl = result.secure_url;

    user.avatar = imageUrl;
    await user.save();

    const updatedUser = await userModel.findById(userId);

    res.status(200).json({ message: "Avatar successfully updated.", user: updatedUser });

  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { userId } = req.user;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await user.checkPassword(oldPassword);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Old password is not valid" });
    }

    user.password = newPassword; 
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  isTwoFactorEnabled,
  updateAvatar,
  changePassword
};
