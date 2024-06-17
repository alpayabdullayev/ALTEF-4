const express = require("express");
const { getAllUsers, deleteUser } = require("../controller/userController");


const UserRouter = express.Router();

UserRouter.get("/user",   getAllUsers);
UserRouter.delete("/user/:id",   deleteUser);

module.exports = UserRouter;
