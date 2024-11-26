const ErrorResponse = require("../helpers/ErrorResponse");

const roleMiddleware = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (roles.length && !roles.includes(req.account.role)) {
      throw new ErrorResponse(403, "Forbidden");
    }
    next();
  };
};

module.exports = {
  roleMiddleware,
};
