const Joi = require("joi");

const accountSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .min(3)
    .required()
    .messages({
      "string.empty": "Username is required",
      "string.min": "Username must be at least 3 characters long",
      "string.pattern.base": "Username must contain only letters",
    }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Kiểm tra định dạng email hợp lệ
    .required()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please enter a valid email address",
    }),
  phone: Joi.string()
    .pattern(/^0\d{9}$/)
    .messages({
      "string.pattern.base":
        "Phone number must start with 0 and be exactly 10 digits",
    }),
  role: Joi.string().valid("user", "admin").optional().messages({
    "any.only": "Invalid role value",
  }),
});

module.exports = (account) =>
  //  accountSchema.validate(account, { abortEarly: false }); nem tat ca cac loi
  accountSchema.validate(account);
