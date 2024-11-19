const ErrorResponse = require("../helpers/ErrorResponse");
const accountModel = require("../models/account.model");

const jwt = require("jsonwebtoken");
require("dotenv").config();

// xu ly accessToken o localStorage
const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new ErrorResponse(401, "Unauthorized");
  }

  const token = await authorization.split(" ")[1];
  const decode = jwt.verify(token, process.env.JWT_SECRET);

  const account = await accountModel.findById(decode._id);
  if (!account) {
    throw new ErrorResponse(401, "Unauthorized");
  }

  req.account = account;
  next();
};

module.exports = {
  authMiddleware,
};
