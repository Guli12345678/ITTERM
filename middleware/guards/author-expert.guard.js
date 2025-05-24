const { sendErrorResponse } = require("../../helpers/send_error_res");

module.exports = (req, res, next) => {
  try {
    // logics here ->
    if (!req.author.is_expert) {
      return res.status(403).send({
        message: "Siz expert emassiz! ",
      });
    }
    next();
  } catch (error) {
    sendErrorResponse();
  }
};
