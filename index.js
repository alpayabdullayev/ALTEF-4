const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToMongoDB = require("./src/db/connectToMongoDB");
const router = require("./src/routes");
const cloudinary = require("./src/utils/cloudinary");

dotenv.config();
const app = express();

console.log("Cloudinary Config:", cloudinary.config());
console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use(router)

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server Connected PORT :  ${PORT}`);
});
