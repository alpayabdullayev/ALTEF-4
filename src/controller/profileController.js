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

module.exports = {
  isTwoFactorEnabled,
};
