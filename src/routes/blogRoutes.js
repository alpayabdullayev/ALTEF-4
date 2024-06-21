const express = require("express");
const upload = require("../helpers/upload");

const {createBlog, getAllBlog, addLikeToBlog, showLikeByBlog, savedBlog, getBlogById } = require("../controller/blogController")

const authenticate = require("../middleware/verifyToken");
const checkRole = require("../middleware/checkRole");

const BlogRouter = express.Router();

BlogRouter.post("/blog", authenticate, checkRole(['admin', 'superAdmin']), upload.single('image'), createBlog);
BlogRouter.get("/blog",getAllBlog)
BlogRouter.get("/blog/:id",getBlogById)
BlogRouter.post("/blog/like", authenticate, addLikeToBlog);
BlogRouter.get("/blog/likes", authenticate, showLikeByBlog);
BlogRouter.post("/blog/save", authenticate, savedBlog);

module.exports = BlogRouter;
