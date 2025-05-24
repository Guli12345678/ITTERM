const Joi = require("joi");

exports.topicValidation = (body) => {
  const topicSchema = Joi.object({
    author_id: Joi.string().required(),
    topic_title: Joi.string().required(),
    topic_text: Joi.string().required(),
    is_checked: Joi.boolean().optional(),
    is_approved: Joi.boolean().optional(),
    refresh_token: Joi.string(),
  });
  return topicSchema.validate(body);
};
