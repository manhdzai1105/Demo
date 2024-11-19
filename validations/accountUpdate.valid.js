const Joi = require("joi");

const accountSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[A-Za-z]+$/)
    .min(3)
    .messages({
      "string.min": "Username must be at least 3 characters long",
      "string.pattern.base": "Username must contain only letters",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Kiểm tra định dạng email hợp lệ
    .messages({
      "string.email": "Please enter a valid email address",
    }),
  phone: Joi.string()
    .pattern(/^0\d{9}$/)
    .messages({
      "string.pattern.base":
        "Phone number must start with 0 and be exactly 10 digits",
    }),
});

module.exports = (accountUpdate) =>
  //  accountSchema.validate(account, { abortEarly: false }); nem tat ca cac loi
  accountSchema.validate(accountUpdate);
