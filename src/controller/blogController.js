const { streamUpload } = require("../helpers/cloudinaryHelper");
const blogModel = require("../model/blogsModel");
const userModel = require("../model/userModel");

const createBlog = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const result = await streamUpload(req.file.buffer);
    const imageUrl = result.secure_url;

    const newBlog = new blogModel({
      ...req.body,
      image: imageUrl,
    });

    await newBlog.save();

    res
      .status(201)
      .json({ message: "Blog created successfully.", blog: newBlog });
  } catch (err) {
    next(err);
  }
};

const addLikeToBlog = async (req, res, next) => {
  try {
    const { id } = req.body;
    const { userId } = req.user;

    let blog = await blogModel.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (blog.likes.includes(userId)) {
      blog.likes = blog.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      blog.likesCount -= 1;

      user.likes = user.likes.filter(
        (like) => like.toString() !== blog._id.toString()
      );
    } else {
      blog.likes.push(userId);
      blog.likesCount += 1;

      user.likes.push(blog._id);
    }

    await blog.save();
    await user.save();

    blog = await blogModel.findById(id).populate([
      {
        path: "author",
        model: "ALTEF4USER",
        select: "username email avatar",
      },
      {
        path: "likes",
        model: "ALTEF4USER",
        select: "username email avatar",
      },
    ]);

    return res
      .status(200)
      .json({ message: "Blog liked/unliked successfully.", blog: blog });
  } catch (err) {
    next(err);
  }
};

const savedBlog = async (req, res, next) => {
  try {
    const { id } = req.body;
    const { userId } = req.user;

    let blog = await blogModel.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.saves.includes(blog._id)) {
      blog.saves -= 1;
      user.saves = user.saves.filter(
        (save) => save.toString() !== blog._id.toString()
      );
    } else {
      blog.saves += 1;
      user.saves.push(blog._id);
    }

    await blog.save();
    await user.save();

    user = await userModel.findById(userId).populate([
      {
        path: "saves",
        model: "ALTEF4BLOG",
      },
    ]);

    return res
      .status(200)
      .json({ message: "Blog saved/unsaved successfully.", user: user });
  } catch (err) {
    next(err);
  }
};

const showLikeByBlog = async (req, res, next) => {
  try {
    const { id } = req.body;

    const blog = await blogModel.findById(id).populate({
      path: "likes",
      model: "ALTEF4USER",
      select: "username email avatar",
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res
      .status(200)
      .json({ message: "Likes retrieved successfully", likes: blog.likes });
  } catch (err) {
    next(err);
  }
};


const getAllBlog = async (req, res, next) => {
  try {
    const blogs = await blogModel.find({}).limit(8).populate({
      path: "author",
      select: "username email avatar",
    });
    res
      .status(200)
      .json({ message: "Blogs retrieved successfully.", blogs: blogs });
  } catch (err) {
    next(err);
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let blog = await blogModel.findById(id).populate("author");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    blog.views += 1;
    await blog.save();

    return res.status(200).json({ message: "Blog retrieved successfully.", blog : blog });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBlog,
  getAllBlog,
  addLikeToBlog,
  showLikeByBlog,
  savedBlog,
  getBlogById
};
