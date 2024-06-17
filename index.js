const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToMongoDB = require("./src/db/connectToMongoDB");
const AuthRouter = require("./src/routes/authRoutes");
const UserRouter = require("./src/routes/userRoutes");

dotenv.config();
const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

app.use("/api", AuthRouter);
app.use("/api",UserRouter)

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server Connected PORT :  ${PORT}`);
});
