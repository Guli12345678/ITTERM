const Joi = require("joi");

const authorFullName = (parent) => {
  return parent.first_name + " " + parent.last_name;
};

exports.authorValidation = (body) => {
  const authorSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    full_name: Joi.string().default(authorFullName),
    nick_name: Joi.string()
      .min(3)
      .message("Nick juda qisqa")
      .max(15)
      .message("Nick juda uzun"),
    email: Joi.string().email().lowercase(),
    phone: Joi.string().pattern(/^\d{2}-\d{3}-\d{2}-\d{2}$/),
    password: Joi.string(),
    confirm_password: Joi.ref("password"),
    info: Joi.string(),
    position: Joi.string(),
    photo: Joi.string().default("/author/avatar.png"),
    is_expert: Joi.boolean().default(false),
    is_active: Joi.boolean().default(false),
    gender: Joi.string().valid("erkak", "ayol"),
    birthdate: Joi.date().max("01.01.2000"),
    port: Joi.number().port(),
    birth_year: Joi.number().integer().max(2020).min(2000),
    referred: Joi.boolean(),
    referred_details: Joi.string().when("referred", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
    colors: Joi.array().items(Joi.string(), Joi.number()),
    is_yes: Joi.boolean().truthy("yes", "ha").valid(true),
  });
  return authorSchema.validate(body, { abortEarly: false }); // error yoki value
};
