const Joi = require("joi");

exports.userValidation = (body) => {
  const userSchema = Joi.object({
    full_name: Joi.string().min(3).max(25).required(),
    age: Joi.number().required(),
    email: Joi.string().required(),
    password: Joi.string().optional(),
    phone: Joi.string().required(),
    is_active: Joi.boolean(),
  });
  return userSchema.validate(body, { abortEarly: false }); // error yoki value
};
