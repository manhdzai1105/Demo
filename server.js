const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./configs/database");
const router = require("./routers");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  }),
);

connectDB();

app.use(cookieParser());

dotenv.config();

const port = process.env.PORT || 3000;

app.use(express.json());

router(app);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
