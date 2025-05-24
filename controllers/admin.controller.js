const { sendErrorResponse } = require("../helpers/send_error_res");
const admin = require("../schemas/Admin");
const { adminValidation } = require("../validation/admin.validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const jwtService = require("../services/jwt.service");
const Admin = require("../schemas/Admin");
const uuid = require("uuid");
const mailService = require("../services/mail.service");
const addadmin = async (req, res) => {
  try {
    const { error, value } = adminValidation(req.body);

    if (error) {
      return sendErrorResponse(error, res);
    }
    const hashed_password = bcrypt.hashSync(value.password, 7);
    const activation_link = await uuid.v4();
    const newadmin = await admin.create({
      ...value,
      password: hashed_password,
      activation_link,
    });
    const link = `${config.get(
      "api_url"
    )}/api/admin/activate/${activation_link}`;

    await mailService.sendMail(value.email, link);

    res.status(200).send(newadmin);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findAll = async (req, res) => {
  try {
    // const authorization = req.headers.authorization;
    // console.log(authorization);
    // if (!authorization) {
    //   return res.status(401).send({ message: "authorization failed" });
    // }
    // const bearer = authorization.split(" ")[0];
    // const token = authorization.split(" ")[1];
    // if (!bearer == "Bearer" || !token) {
    //   return res.status(401).send({ message: "Bearer token berilmagan" });
    // }
    // const decodedPayload = jwt.verify(token, config.get("admintokenKey"));
    // console.log(decodedPayload);
    const newadmin = await admin.find();
    res.status(200).send({ newadmin });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const newadmin = await admin.findById(id);
    res.status(200).send(newadmin);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const newadmin = await admin.findByIdAndUpdate(id, data);
    res.status(200).send(newadmin);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const removeById = async (req, res) => {
  try {
    const { id } = req.params;
    const newadmin = await admin.findByIdAndDelete(id);
    res.status(200).send({ message: "admin deleted successfully ✅" });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const loginadmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sdsd = await admin.findOne({ email });
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
      is_active: sdsd.is_active,
      is_expert: sdsd.is_expert,
    };

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
const logoutadmin = async (req, res) => {
  try {
    console.log(req.cookies);
    console.log(req.headers.cookies);
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "Cookieda refreshToken topilmadi" });
    }
    const admin = await admin.findOneAndUpdate(
      {
        refresh_token: refreshToken,
      },
      {
        refresh_token: "",
      },
      { new: true }
    );
    if (!admin) {
      return res.status(400).send({ message: "Token notogri" });
    }
    res.clearCookie("refreshToken");
    res.send({ admin });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const refreshadminToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }
    await jwtService.verifyRefreshToken(refreshToken);

    const admins = await Admin.findOne({ refresh_token: refreshToken });
    if (!admins) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
    }
    const payload = {
      id: Admin._id,
      email: Admin.email,
      is_active: Admin.is_active,
      is_expert: Admin.is_expert,
    };

    const tokens = jwtService.generateTokens(payload);
    admins.refresh_token = tokens.refreshToken;
    await admins.save();

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
      message: "tokenlar yangilandi",
      id: admin.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const adminActivate = async (req, res) => {
  try {
    const { link } = req.params;
    const admins = await admin.findOne({ activation_link: link });

    if (!admins) {
      return res.status(400).send({ message: "admin link incorrect" });
    }
    if (admins.is_active) {
      return res.status(400).send({ message: "admin avval faollashtirilgan" });
    }
    admins.is_active = true;
    await admins.save();
    res.send({
      message: "admin faollashtirildi",
      is_active: admins.is_active,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addadmin,
  findAll,
  findOne,
  updateById,
  removeById,
  loginadmin,
  logoutadmin,
  refreshadminToken,
  adminActivate,
};
