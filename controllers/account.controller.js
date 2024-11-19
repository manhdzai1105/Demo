const accountModel = require("../models/account.model");
const accountValid = require("../validations/account.valid");
const accountUpdateValid = require("../validations/accountUpdate.valid");
const ErrorResponse = require("../helpers/ErrorResponse");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { mailSender } = require("../helpers/mail.sender");
const crypto = require("crypto");
const passwordValid = require("../validations/password.valid");
const {
  deleteImages,
  restoreImage,
} = require("../middlewares/uploadCloudinary");
require("dotenv").config();
const { PER_PAGE } = require("../constants/paging");

const createAccount = async (req, res) => {
  const body = req.body;

  const { error, value } = accountValid(body);
  // nem loi validation
  if (error) {
    throw new ErrorResponse(400, error.message);
  }

  const account = await accountModel.create(value);
  return res.status(201).json(account);
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const account = await accountModel.findOne({ email });

  if (!account) {
    throw new ErrorResponse(401, "Tai khoan hoac mat khau khong chinh xac");
  }

  const checkPass = await bcrypt.compare(password, account.password);
  if (!checkPass) {
    throw new ErrorResponse(401, "Tai khoan hoac mat khau khong chinh xac");
  }

  const payload = {
    _id: account._id,
    username: account.username,
    role: account.role,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ _id: account._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

  await accountModel.findByIdAndUpdate(
    account._id,
    { refreshToken },
    { new: true },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json({ message: "Login successfully", ...payload, accessToken });
};

const forgotPassword = async (req, res) => {
  const { email } = req.query;
  const user = await accountModel.findOne({ email: email });
  if (!user) {
    throw new ErrorResponse(404, "Tài khoản không tồn tại.");
  }
  const resetToken = await user.createPasswordChangeToken();

  mailSender({
    email: email,
    subject: "Reset Password",
    html: `Xin vui lòng click vào liên kết dưới đây để thay đổi mật khẩu. Liên kết này có thời hạn 15 phút kể từ bây giờ.
          <a href="${process.env.URL_SERVER}/reset-password/${resetToken}">Click here</a>`,
  });
  return res.status(200).json({
    message:
      "Hệ thống đã gửi link thay đổi mật khẩu tới email của bạn. Vui lòng check email!",
  });
};

const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await accountModel.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new ErrorResponse(403, "Invalid reset token");
  }

  const { error, value } = passwordValid(password);
  if (error) {
    throw new ErrorResponse(400, error.message);
  }
  user.password = value.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  return res.status(200).json({ message: "Password reset successfully!" });
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ErrorResponse(401, "No fresh token in cookies");
  }
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await accountModel.findOne({
    _id: decoded._id,
    refreshToken: refreshToken,
  });
  if (!user) {
    throw new ErrorResponse(403, "Invalid refresh token");
  }
  const payload = {
    _id: user._id,
    username: user.username,
    role: user.role,
  };
  const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.status(200).json({ ...payload, accessToken: newAccessToken });
};

const logOut = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ErrorResponse(401, "No fresh token in cookies");
  }
  const account = await accountModel.findOneAndUpdate(
    { refreshToken: refreshToken },
    { refreshToken: "" },
    { new: true },
  );

  if (!account) {
    throw new ErrorResponse(403, "Invalid refresh token");
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

const profileAuthCurrent = async (req, res) => {
  const id = req.account._id;
  const account = await accountModel.findById(id);
  if (!account) {
    throw new ErrorResponse(401, "Unauthorized");
  }
  return res.status(200).json(account);
};

const updateAvatar = async (req, res) => {
  const id = req.account._id;
  const account = await accountModel.findById(id);
  if (!account) {
    throw new ErrorResponse(401, "Unauthorized");
  }
  try {
    if (account.publicId) {
      await deleteImages(account.publicId);
    }
    account.imageUrl = req.imageUrl;
    account.publicId = req.publicId;
    await account.save();

    // Trả về thông tin người dùng đã được cập nhật
    res
      .status(200)
      .json({ message: "Update avatar thành công!", data: account });
  } catch (error) {
    // Nếu có lỗi, khôi phục ảnh cũ nếu đã xóa
    if (account && account.publicId) {
      await restoreImage(account.imageUrl, account.publicId);
    }
    await deleteImages(req.publicId);
    next(error);
  }
};

const updateProfile = async (req, res) => {
  const id = req.account._id;
  const account = await accountModel.findById(id);
  if (!account) {
    throw new ErrorResponse(401, "Unauthorized");
  }
  const body = req.body;
  const { error, value } = accountUpdateValid(body);

  if (error) {
    throw new ErrorResponse(400, error.message);
  }

  // Kiểm tra nếu thông tin mới trùng với thông tin hiện tại
  const unchangedFields = Object.keys(value).filter((key) => {
    const currentValue = account[key];
    const newValue = value[key];

    // So sánh giá trị, chuyển đổi sang chuỗi để đảm bảo khớp kiểu
    return String(currentValue) === String(newValue);
  });

  if (unchangedFields.length > 0) {
    throw new ErrorResponse(
      400,
      `No changes detected in fields: ${unchangedFields.join(", ")}`,
    );
  }

  const accountUpdate = await accountModel.findByIdAndUpdate(id, value, {
    new: true,
  });

  return res.status(200).json({
    message: "Profile updated successfully",
    data: accountUpdate,
  });
};

const getAccount = async (req, res) => {
  const bodyQuery = {};
  const { username, sort = "asc" } = req.query; // Thêm sort vào query
  const { per_page = PER_PAGE, page = 1 } = req.query;

  // Thêm điều kiện tìm kiếm theo tên người dùng (nếu có)
  if (username) {
    bodyQuery.username = { $regex: new RegExp(`^${username}`, "i") };
  }

  // Xử lý sắp xếp theo tên người dùng (hoặc có thể thay đổi thành trường khác)
  const sortQuery = sort === "asc" ? { username: 1 } : { username: -1 }; // Sắp xếp theo tên, tăng dần hoặc giảm dần

  try {
    // Lấy dữ liệu tài khoản từ database với các điều kiện tìm kiếm, phân trang và sắp xếp
    const account = await accountModel
      .find(bodyQuery)
      .skip((page - 1) * per_page)
      .limit(per_page)
      .sort(sortQuery) // Áp dụng sắp xếp
      .exec();

    if (!account || account.length === 0) {
      return res.status(404).json({ message: "No accounts found" });
    }

    // Đếm số tài khoản phù hợp với điều kiện tìm kiếm
    const count = await accountModel.countDocuments(bodyQuery);

    const bodyResponse = {
      current_page: +page,
      total_page: Math.ceil(count / per_page),
      count,
      per_page,
      data: account,
    };
    return res.status(200).json(bodyResponse);
  } catch (error) {
    // Xử lý lỗi
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;
  const account = await accountModel.findByIdAndDelete(id);
  if (!account) {
    return res.status(404).json({ message: "Tài khoản không tồn tại." });
  }
  res.status(200).json({ message: "Tài khoản đã được xóa thành công." });
};

module.exports = {
  createAccount,
  login,
  resetPassword,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logOut,
  profileAuthCurrent,
  updateAvatar,
  updateProfile,
  profileAuthCurrent,
  getAccount,
  deleteAccount,
};
