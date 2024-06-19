const express = require("express");
const upload = require("../helpers/upload");

const {createBlog, getAllBlog } = require("../controller/blogController")

const authenticate = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

const BlogRouter = express.Router();

BlogRouter.post("/blog", authenticate, checkRole(['admin', 'superAdmin']), upload.single('image'), createBlog);
BlogRouter.get("/blog",getAllBlog)

module.exports = BlogRouter;
