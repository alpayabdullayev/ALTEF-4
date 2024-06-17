const userModel = require("../model/userModel");

const getAllUsers = async (req, res) => {
  try {
    const getAll = await userModel.find({});
    res.status(200).json(getAll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
    try {
      const deleteUser = await userModel.findByIdAndDelete(req.params.id);
      res.status(200).json(deleteUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}

module.exports = {
  getAllUsers,
  deleteUser
};
