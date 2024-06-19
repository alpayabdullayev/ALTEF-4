const express = require("express");
const BlogRouter = require("./blogRoutes");
const UserRouter = require("./userRoutes");
const AuthRouter = require("./authRoutes");


const router = express.Router();

router.use("/api", AuthRouter);
router.use("/api", UserRouter);
router.use("/api", BlogRouter);

module.exports = router;