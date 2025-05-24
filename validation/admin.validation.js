const Joi = require("joi");

exports.adminValidation = (body) => {
  const adminSchema = Joi.object({
    name: Joi.string().min(3).max(25).required(),
    email: Joi.string().email().lowercase(),
    phone: Joi.string().pattern(/^\d{2}-\d{3}-\d{2}-\d{2}$/),
    password: Joi.string().optional(),
    is_active: Joi.boolean().optional(),
    is_creator: Joi.boolean().optional(),
    created_date: Joi.date().default(Date.now),
    updated_date: Joi.date().default(Date.now),
  });
  return adminSchema.validate(body, { abortEarly: false }); // error yoki value
};
