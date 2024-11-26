const express = require("express");
const asyncMiddleware = require("../middlewares/async.middleware");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logOut,
  profileAuthCurrent,
  updateAvatar,
  getAccount,
  deleteAccount,
  editAccount,
  createAccount,
  updateProfile,
  changePassword,
} = require("../controllers/account.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer");
const { uploadSingle } = require("../middlewares/uploadCloudinary");
const { roleMiddleware } = require("../middlewares/role.middleware");

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
  .get(
    asyncMiddleware(authMiddleware),
    roleMiddleware(["admin"]),
    asyncMiddleware(getAccount),
  );

router
  .route("/change-password")
  .put(asyncMiddleware(authMiddleware), asyncMiddleware(changePassword));

router
  .route("/profileAuthCurrent")
  .get(asyncMiddleware(authMiddleware), asyncMiddleware(profileAuthCurrent));

router
  .route("/delete-account/:id")
  .delete(
    asyncMiddleware(authMiddleware),
    roleMiddleware(["admin"]),
    asyncMiddleware(deleteAccount),
  );

router
  .route("/update-account/:id")
  .put(
    asyncMiddleware(authMiddleware),
    roleMiddleware(["admin"]),
    upload.single("avatar"),
    uploadSingle,
    editAccount,
  );

router
  .route("/create-account")
  .post(
    asyncMiddleware(authMiddleware),
    roleMiddleware(["admin"]),
    asyncMiddleware(createAccount),
  );

router
  .route("/update-profile")
  .put(asyncMiddleware(authMiddleware), asyncMiddleware(updateProfile));

router.route("/register").post(asyncMiddleware(register));
router.route("/login").post(asyncMiddleware(login));
router.route("/forgotPassword").get(asyncMiddleware(forgotPassword));
router.route("/resetPassword/:resetToken").put(asyncMiddleware(resetPassword));
router.route("/refreshAccessToken").post(asyncMiddleware(refreshAccessToken));
router.route("/logOut").get(asyncMiddleware(logOut));

module.exports = router;
