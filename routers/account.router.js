const express = require("express");
const asyncMiddleware = require("../middlewares/async.middleware");
const {
  createAccount,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logOut,
  profileAuthCurrent,
  updateAvatar,
  updateProfile,
  getAccount,
  deleteAccount,
} = require("../controllers/account.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");
const { uploadSingle } = require("../middlewares/uploadCloudinary");

const router = express.Router();
router
  .route("/update-Avatar")
  .put(
    asyncMiddleware(authMiddleware),
    upload.single("avatar"),
    uploadSingle,
    updateAvatar,
  );
router
  .route("/")
  .get(asyncMiddleware(authMiddleware), asyncMiddleware(getAccount));
router
  .route("/profileAuthCurrent")
  .get(asyncMiddleware(authMiddleware), asyncMiddleware(profileAuthCurrent));

router
  .route("/update-profile")
  .put(asyncMiddleware(authMiddleware), asyncMiddleware(updateProfile));

router
  .route("/delete-account/:id")
  .delete(asyncMiddleware(authMiddleware), asyncMiddleware(deleteAccount));

router.route("/register").post(asyncMiddleware(createAccount));
router.route("/login").post(asyncMiddleware(login));
router.route("/forgotPassword").get(asyncMiddleware(forgotPassword));
router.route("/resetPassword/:resetToken").put(asyncMiddleware(resetPassword));
router.route("/refreshAccessToken").post(asyncMiddleware(refreshAccessToken));
router.route("/logOut").get(asyncMiddleware(logOut));

module.exports = router;
