const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");

const PORT = config.get("PORT") || 3030;

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

//const
var winston = require("winston"),
  expressWinston = require("express-winston");

//logs:
// const logger = require("./service/logger.service");

// logger.log("info", "Bu oddiy log ma'lumoti");
// logger.error("Error malumoti");
// logger.debug("debug malumoti");
// logger.warn("warn malumoti");
// logger.info("info malumoti");
// logger.trace("trace malumoti");
// logger.table(["JS", "Python", "Java"]);
// logger.table([
//   ["Karim", 2],
//   ["Salim", 3],
//   ["Ali", 5],
// ]);
//------------------------------------

// console.log(process.env.NODE_ENV);
// console.log(process.env.secret_token);
// console.log(config.get("secret_token"));

// //process.on("<turli signallar mavjud>")

// process.on("uncaughtException", (exception) => {
//   console.log("uncaughtException: ", exception.message);
// });

// process.on("unhandledRejection", (rejection) => {
//   console.log("unhandledRejection: ", rejection);
// });

const app = express();
app.use(express.json());
app.use(cookieParser()); //parse //xatolar frontdan chiqsa shu yerdan chiqadi  va eng ohirida error handler bolsa shunga boradi
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  })
);

const indexRouter = require("./routes/index.routes"); // backend
const errorHandlingMiddleware = require("./middleware/errors/error-handling.middleware");
const requestLogger = require("./loggers/request.logger");
const requestErrorLogger = require("./loggers/request.error.logger");
// const winston = require("winston/lib/winston/config");
app.use(requestLogger);
app.use("/api", indexRouter);
app.use(requestErrorLogger);
app.use(
  expressWinston.errorLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json()
    ),
  })
);
app.use(errorHandlingMiddleware); // error handling eng oohirida  yozilishi kk

async function start() {
  try {
    const uri = config.get("dbUri");
    await mongoose.connect(uri);
    app.listen(PORT, () => {
      console.log(`server started at: http://localhost:${PORT});`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();
