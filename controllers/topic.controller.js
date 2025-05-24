const { sendErrorResponse } = require("../helpers/send_error_res");
const Topic = require("../schemas/Topic");
const { topicValidation } = require("../validation/topic.validation");
const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
const config = require("config");
const jwtService = require("../services/jwt.service");
const addTopic = async (req, res) => {
  try {
    const { error, value } = topicValidation(req.body);

    if (error) {
      return sendErrorResponse(error, res);
    }

    const newTopic = await Topic.create(req.body);
    console.log("Request Body:", req.body);

    res.status(200).send(newTopic);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const findAll = async (req, res) => {
  try {
    const topics = await Topic.find().populate("author_id");
    res.status(200).send({ topics: topics });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id);
    res.status(200).send(topic);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const updatedTopic = await Topic.findByIdAndUpdate(id, data, { new: true });
    res.status(200).send(updatedTopic);
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const removeById = async (req, res) => {
  try {
    const { id } = req.params;
    await Topic.findByIdAndDelete(id);
    res.status(200).send({ message: "Topic deleted successfully ✅" });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

const logintopic = async (req, res) => {
  try {
    const { topic_text } = req.body;
    const sdsd = await Topic.findOne({ topic_text });
    if (!sdsd) {
      return res
        .status(401)
        .send({ message: "Topic_title or topic_text is incorrect" });
    }
    const hashedText = bcrypt.hashSync(topic_text, 10);

    const validText = bcrypt.compareSync(topic_text, hashedText);
    console.log(validText);

    if (!validText) {
      return res.status(401).send({ message: "Topic text might be incorrect" });
    }
    const payload = {
      id: sdsd._id,
      topic_text: sdsd.topic_text,
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
const logouttopic = async (req, res) => {
  try {
    console.log(req.cookies);
    console.log(req.headers.cookies);
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "Cookieda refreshToken topilmadi" });
    }
    const newtopic = await Topic.findOneAndUpdate(
      {
        refresh_token: refreshToken,
      },
      {
        refresh_token: "",
      },
      { new: true }
    );
    if (!newtopic) {
      return res.status(400).send({ message: "Token notogri" });
    }
    res.clearCookie("refreshToken");
    res.send({ newtopic });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};
const refreshtopicToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res
        .status(400)
        .send({ message: "cookieda refresh token topilmadi" });
    }
    await jwtService.verifyRefreshToken(refreshToken);
    const newtopic = await Topic.findOne({ refresh_token: refreshToken });
    if (!newtopic) {
      return res
        .status(401)
        .send({ message: "bazada refresh token topilmadi" });
    }
    const payload = {
      id: newtopic._id,
      topic_text: newtopic.topic_text,
    };

    const tokens = jwtService.generateTokens(payload);
    newtopic.refresh_token = tokens.refreshToken;
    await newtopic.save();

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
      id: newtopic.id,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    sendErrorResponse(error, res);
  }
};

module.exports = {
  addTopic,
  findAll,
  findOne,
  updateById,
  removeById,
  logintopic,
  logouttopic,
  refreshtopicToken,
};
