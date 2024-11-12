module.exports = (err, req, res, next) => {
  let error = { ...err };

  if (err?.name === "CastError") {
    error.statusCode = 404;
    error.message = "Khong tim thay tai nguyen";
  }

  if (err.statusCode === 400) {
    error.statusCode = 400;
    error.message = err.message;
  }

  if (err.statusCode === 401) {
    error.statusCode = 401;
    error.message = err.message;
  }

  if (err.statusCode === 403) {
    error.statusCode = 403;
    error.message = err.message;
  }

  if (err.statusCode === 404) {
    error.statusCode = 404;
    error.message = err.message;
  }

  if (error.code === 11000) {
    // E11000 là mã lỗi cho lỗi trùng lặp khóa
    const field = Object.keys(error.keyPattern)[0]; // Lấy tên trường gây ra lỗi trùng lặp

    switch (field) {
      case "name":
        error.statusCode = 400;
        error.message = "Name đã tồn tại";
        break;
      case "username":
        error.statusCode = 400;
        error.message = "Username đã tồn tại";
        break;
      case "phone":
        error.statusCode = 400;
        error.message = "Phone đã tồn tại";
        break;
      case "email":
        error.statusCode = 400;
        error.message = "Email đã tồn tại";
        break;
      default:
        error.statusCode = 400;
        error.message = "Duplicate field value";
        break;
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || err.message || "Internal server error";

  return res.status(statusCode).json({
    statusCode,
    message,
  });
};
