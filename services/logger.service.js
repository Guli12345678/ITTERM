const winston = require("winston");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, colorize, json } = format;
require("winston-mongodb");
const config = require("config");
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = createLogger({
  format: combine(
    colorize({ all: true }),
    label({ label: "ITTERM" }),
    timestamp(),
    myFormat,
    json()
  ),
  transports: [
    new transports.Console({ level: "silly" }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combine.log", level: "info" }),
    new transports.MongoDB({
      db: config.get("dbUri"),
      collection: "log",
    }),
    new transports.File({ filename: "logs/express-http.log", level: "info" }),
  ],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "logs/rejections.log" })],
});

logger.exitOnError = false;

module.exports = logger;
