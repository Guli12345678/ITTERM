const { sendErrorResponse } = require("../helpers/send_error_res");
const author = require("../schemas/Author");
const { authorValidation } = require("../validation/author.validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const jwtService = require("../services/jwt.service");
const Author = require("../schemas/Author");
const uuid = require("uuid");
const mailService = require("../services/mail.service");
const addAuthor = async (req, res) => {
  try {
    const { error, value } = authorValidation(req.body);

    if (error) {
      return sendErrorResponse(error, res);
    }
    const hashed_password = bcrypt.hashSync(value.password, 7);
    const activation_link = await uuid.v4();
    const newAuthor = await author.create({
      ...value,
      password: hashed_password,
      activation_link,
    });
    const link = `${config.get(
      "api_url"
    )}/api/author/activate/${activation_link}`;

    await mailService.sendMail(value.email, link);

    res.status(200).send(newAuthor);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findAll = async (req, res) => {
  try {
    // const authorization = req.headers.authorization;
    // console.log(authorization);
    // if (!authorization) {
    //   return res.status(401).send({ message: "Authorization failed" });
    // }
    // const bearer = authorization.split(" ")[0];
    // const token = authorization.split(" ")[1];
    // if (!bearer == "Bearer" || !token) {
    //   return res.status(401).send({ message: "Bearer token berilmagan" });
    // }
    // const decodedPayload = jwt.verify(token, config.get("authortokenKey"));
    // console.log(decodedPayload);
    const newauthor = await author.find();
    res.status(200).send({authors: newauthor});
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const newauthor = await author.findById(id);
    res.status(200).send(newauthor);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const newauthor = await author.findByIdAndUpdate(id, data);
    res.status(200).send(newauthor);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const removeById = async (req, res) => {
  try {
    const { id } = req.params;
    const newauthor = await author.findByIdAndDelete(id);
    res.status(200).send({ message: "author deleted successfully ✅" });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const loginAuthor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const sdsd = await author.findOne({ email });
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
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const logoutAuthor = async (req, res) => {
  try {
    console.log(req.cookies);
    console.log(req.headers.cookies);
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "Cookieda refreshToken topilmadi" });
    }
    const author = await Author.findOneAndUpdate(
      {
        refresh_token: refreshToken,
      },
      {
        refresh_token: "",
      },
      { new: true }
    );
    if (!author) {
      return res.status(400).send({ message: "Token notogri" });
    }
    res.clearCookie("refreshToken");
    res.send({ author });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const refreshAuthorToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }
    await jwtService.verifyRefreshToken(refreshToken);

    const author = await Author.findOne({ refresh_token: refreshToken });
    if (!author) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
    }
    const payload = {
      id: author._id,
      email: author.email,
      is_active: author.is_active,
      is_expert: author.is_expert,
    };

    const tokens = jwtService.generateTokens(payload);
    author.refresh_token = tokens.refreshToken;
    await author.save();

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("cookie_refresh_time"),
    });
    //T -----------------------------TEST UCHUN ERROR-------------------------------------------------//
    // try {
    //   setTimeout(function () {
    //     throw new Error("uncaughtException example");
    //   }, 1000);
    // } catch (error) {
    //   console.log(error);
    // }

    // new Promise((_, reject) => {
    //   reject(new Error("UnhandledRejection example"));
    // });
    //T -----------------------------TEST UCHUN ERROR-------------------------------------------------//
    res.status(201).send({
      message: "tokenlar yangilandi",
      id: author.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const authorActivate = async (req, res) => {
  try {
    const { link } = req.params;
    const author = await Author.findOne({ activation_link: link });

    if (!author) {
      return res.status(400).send({ message: "Author link incorrect" });
    }
    if (author.is_active) {
      return res.status(400).send({ message: "Author avval faollashtirilgan" });
    }
    author.is_active = true;
    await author.save();
    res.send({
      message: "Author faollashtirildi",
      is_active: author.is_active,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addAuthor,
  findAll,
  findOne,
  updateById,
  removeById,
  loginAuthor,
  logoutAuthor,
  refreshAuthorToken,
  authorActivate,
};
