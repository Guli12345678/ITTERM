const { sendErrorResponse } = require("../../helpers/send_error_res");
const jwt = require("jsonwebtoken");

const config = require("config");
const jwtService = require("../../services/jwt.service");

module.exports = async (req, res, next) => {
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
    // const decodedPayload = jwt.verify(token, config.get("adminTokenKey"));

    const decodedPayload = await jwtService.verifyAccessToken(token);

    req.admin = decodedPayload;

    next();
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
