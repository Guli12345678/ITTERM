const { sendErrorResponse } = require("../helpers/send_error_res");
const dict = require("../schemas/Dict");
const { dictValidation } = require("../validation/dict.validation");
const bcrypt = require("bcrypt");
const config = require("config");
const jwtService = require("../services/jwt.service");
const adddict = async (req, res) => {
  try {
    const { error, value } = dictValidation(req.body);

    if (error) {
      return sendErrorResponse(error, res);
    }
    const newdict = await dict.create(value); // create esdan chiqmasin
    res.status(200).send({ newdict });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findAll = async (req, res) => {
  try {
    const newdict = await dict.find();
    res.status(200).send({ dicts: newdict });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const newdict = await dict.findById(id);
    res.status(200).send(newdict);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const newdict = await dict.findByIdAndUpdate(id, data);
    res.status(200).send(newdict);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const removeById = async (req, res) => {
  try {
    const { id } = req.params;
    const newdict = await dict.findByIdAndDelete(id);
    res.status(200).send({ message: "dict deleted successfully ✅" });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const logindict = async (req, res) => {
  try {
    const { term } = req.body;
    const sdsd = await dict.findOne({ term });
    if (!sdsd) {
      return res.status(401).send({ message: "term or dict is incorrect" });
    }
    const hashedText = bcrypt.hashSync(term, 10);

    const validText = bcrypt.compareSync(term, hashedText);
    console.log(validText);

    if (!validText) {
      return res.status(401).send({ message: "dict term might be incorrect" });
    }
    const payload = {
      id: sdsd._id,
      term: sdsd.term,
    };
    // const token = jwt.sign(payload, config.get("tokenKey"), {
    //   expiresIn: config.get("tokenExpTime"),
    // }); -----> for only one token

    const tokens = jwtService.generateTokens(payload);
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
const logoutdict = async (req, res) => {
  try {
    console.log(req.cookies);
    console.log(req.headers.cookies);
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "Cookieda refreshToken topilmadi" });
    }
    const newdict = await dict.findOneAndUpdate(
      {
        refresh_token: refreshToken,
      },
      {
        refresh_token: "",
      },
      { new: true }
    );
    if (!newdict) {
      return res.status(400).send({ message: "Token notogri" });
    }
    res.clearCookie("refreshToken");
    res.send({ newdict });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const refreshdictToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }
    await jwtService.verifyRefreshToken(refreshToken);
    const newdict = await dict.findOne({ refresh_token: refreshToken });
    if (!newdict) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
    }
    const payload = {
      id: newdict._id,
      term: newdict.term,
    };

    const tokens = jwtService.generateTokens(payload);
    newdict.refresh_token = tokens.refreshToken;
    await newdict.save();

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
      message: "Tokenlar yangilandi",
      id: newdict.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

module.exports = {
  adddict,
  findAll,
  findOne,
  updateById,
  removeById,
  logindict,
  logoutdict,
  refreshdictToken,
};
