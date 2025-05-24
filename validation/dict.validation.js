const Joi = require("joi");

exports.dictValidation = (body) => {
  const dictschema = Joi.object({
    term: Joi.string()
      .min(2)
      .message("IT Termin 1 ta harfdan kam bolmasligi kerak")
      .required()
      .messages({
        "string.empty": "Lugat bo'sh bolishi mumkin emas ",
        "any.required": "Lugat albatta kiritilishi kerak ",
      }),
    letter: Joi.string(),
    refresh_token: Joi.string(),
  });
  return dictschema.validate(body); // error yoki value
};
