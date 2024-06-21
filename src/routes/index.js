const express = require("express");
const BlogRouter = require("./blogRoutes");
const UserRouter = require("./userRoutes");
const AuthRouter = require("./authRoutes");
const ProfileRouter = require("./profileRoutes");


const router = express.Router();

router.use("/api", AuthRouter);
router.use("/api", UserRouter);
router.use("/api", BlogRouter);
router.use("/api", ProfileRouter);

module.exports = router;