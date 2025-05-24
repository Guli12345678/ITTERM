const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
const indexRouter = require("./routes/index.routes"); // backend
const viewRouter = require("./routes/views.routes"); // backend
const errorHandlingMiddleware = require("./middleware/errors/error-handling.middleware");
const exHbs = require("express-handlebars");

// IT-TERMda Topics va Dictionary bo'limlarini xuddi authors kabi guard orqali chiqarish

const PORT = config.get("PORT") || 3030;

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
app.use(express.json());
app.use(cookieParser()); //parse

const hbs = exHbs.create({
  default: "main",
  extname: "hbs",
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");
app.use(express.static("views"));

app.use("/", viewRouter); // frontend
app.use("/api", indexRouter); // backend

app.use(errorHandlingMiddleware); // error handling eng oohirida  yozilishi kk

async function start() {
  try {
    const uri = config.get("dbUri");
    await mongoose.connect(uri);
    app.listen(PORT, () => {
      console.log(`server started at port: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
start();
