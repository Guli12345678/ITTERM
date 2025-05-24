const jwt = require("jsonwebtoken");

const config = require("config");

module.exports = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    console.log(authorization);
    if (!authorization) {
      return res.status(401).send({ message: "Authorization failed" });
    }
    const bearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];
    if (!bearer == "Bearer" || !token) {
      return res.status(401).send({ message: "Bearer token berilmagan" });
    }
    const decodedPayload = jwt.verify(token, config.get("authorTokenKey"));
    req.author = decodedPayload;

    // After learning email
    if (!decodedPayload.is_active) {
      return res.status(403).send({ message: "Active bolmagan foydalanuvchi" });
    }

    next();
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
