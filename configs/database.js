const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Kết nối MongoDB thành công!");
  } catch (err) {
    console.log("Kết nối MongoDB thất bại");
    console.log(err.message);
  }
};

module.exports = connectDB;
