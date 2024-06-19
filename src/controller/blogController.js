const { streamUpload } = require("../helpers/cloudinaryHelper");
const blogModel = require("../model/blogsModel");

const createBlog = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const result = await streamUpload(req.file.buffer);
    const imageUrl = result.secure_url;

    const newBlog = new blogModel({
      ...req.body,
      image: imageUrl,
    });

    await newBlog.save();

    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//TEST
const getAllBlog = async (req, res) => {
  try {
    const getAll = await blogModel.find({}).populate({
      path: "author",
      select: "username email avatar",
    });
    res.status(200).json(getAll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBlog,
  getAllBlog,
};
