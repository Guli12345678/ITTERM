const { sendErrorResponse } = require("../helpers/send_error_res");
const user = require("../schemas/User");
const { userValidation } = require("../validation/user.validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const jwtService = require("../services/jwt.service");
const uuid = require("uuid");
const mailService = require("../services/mail.service");
const User = require("../schemas/User");
const adduser = async (req, res) => {
  try {
    const { error, value } = userValidation(req.body);

    if (error) {
      return sendErrorResponse(error, res);
    }
    const hashed_password = bcrypt.hashSync(value.password, 7);
    const activation_link = await uuid.v4();
    const newuser = await user.create({
      ...value,
      password: hashed_password,
      activation_link,
    });
    const link = `${config.get(
      "api_url"
    )}/api/users/activate/${activation_link}`;

    await mailService.sendMail(value.email, link);

    res.status(200).send(newuser);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findAll = async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    console.log(authorization);
    if (!authorization) {
      return res.status(401).send({ message: "authorization failed" });
    }
    const bearer = authorization.split(" ")[0];
    const token = authorization.split(" ")[1];
    if (!bearer == "Bearer" || !token) {
      return res.status(401).send({ message: "Bearer token berilmagan" });
    }
    const decodedPayload = jwt.verify(token, config.get("userTokenKey"));
    console.log(decodedPayload);
    const newuser = await user.find();
    res.status(200).send(newuser);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const newuser = await user.findById(id);
    res.status(200).send(newuser);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const newuser = await user.findByIdAndUpdate(id, data);
    res.status(200).send(newuser);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const removeById = async (req, res) => {
  try {
    const { id } = req.params;
    const newuser = await user.findByIdAndDelete(id);
    res.status(200).send({ message: "user deleted successfully ✅" });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const loginuser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sdsd = await user.findOne({ email });
    if (!sdsd) {
      return res.status(401).send({ message: "Email yoki password notogri" });
    }
    const validPassword = bcrypt.compareSync(password, sdsd.password);
    if (!validPassword) {
      return res.status(401).send({ message: "Email yoki password notogri" });
    }
    const payload = {
      id: sdsd._id,
      email: sdsd.email,
    };
    // const token = jwt.sign(payload, config.get("tokenKey"), {
    //   expiresIn: config.get("tokenExpTime"),
    // }); -----> for only one token

    const tokens = jwtService.generateTokens(payload);
    sdsd.refresh_token = tokens.refreshToken;
    await sdsd.save();
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time"),
    });
    res.status(200).send({
      message: "Tizimga xush kelibsiz",
      id: sdsd._id,
      token: tokens,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const logoutuser = async (req, res) => {
  try {
    console.log(req.cookies);
    console.log(req.headers.cookies);
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "Cookieda refreshToken topilmadi" });
    }
    const newuser = await user.findOneAndUpdate(
      {
        refresh_token: refreshToken,
      },
      {
        refresh_token: "",
      },
      { new: true }
    );
    if (!newuser) {
      return res.status(400).send({ message: "Token notogri" });
    }
    res.clearCookie("refreshToken");
    res.send({ newuser });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const refreshuserToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }
    await jwtService.verifyRefreshToken(refreshToken);
    const newuser = await User.findOne({ refresh_token: refreshToken });
    if (!newuser) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
    }
    const payload = {
      id: newuser._id,
      email: newuser.email,
    };

    const tokens = jwtService.generateTokens(payload);
    newuser.refresh_token = tokens.refreshToken;
    await newuser.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time"),
    });
    //T -----------------------------TEST UCHUN ERROR-------------------------------------------------//
    try {
      setTimeout(function () {
        throw new Error("uncaughtException example");
      }, 1000);
    } catch (error) {
      console.log(error);
    }

    new Promise((_, reject) => {
      reject(new Error("UnhandledRejection example"));
    });
    //T -----------------------------TEST UCHUN ERROR-------------------------------------------------//
    res.status(201).send({
      message: "Tokenlar yangilandi",
      id: user.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const userActivate = async (req, res) => {
  try {
    const link = req.params;
    const newuser = await user.findOne({ activation_link: link });

    if (!newuser) {
      return res.status(400).send({ message: "user link incorrect" });
    }
    if (newuser.is_active) {
      return res.status(400).send({ message: "user avval faollashtirilgan" });
    }
    newuser.is_active = true;
    await newuser.save();
    res.send({
      message: "user faollashtirildi",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  adduser,
  findAll,
  findOne,
  updateById,
  removeById,
  loginuser,
  logoutuser,
  refreshuserToken,
  userActivate,
};
