const express = require("express");
const asyncMiddleware = require("../middlewares/async.middleware");
const {
  createAccount,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logOut,
} = require("../controllers/account.controller");

const router = express.Router();

router.route("/register").post(asyncMiddleware(createAccount));
router.route("/login").post(asyncMiddleware(login));
router.route("/forgotPassword").get(asyncMiddleware(forgotPassword));
router.route("/resetPassword").put(asyncMiddleware(resetPassword));
router.route("/refreshAccessToken").post(asyncMiddleware(refreshAccessToken));
router.route("/logOut").get(asyncMiddleware(logOut));

module.exports = router;
