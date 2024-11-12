const Joi = require("joi");

const passwordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
  }),
});

module.exports = (password) => {
  return passwordSchema.validate({ password });
};
