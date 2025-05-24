// Admin va User uchun refresh token yozish
// User uchun send mail va activate yozish

const router = require("express").Router();

const authorRouter = require("./author.routes");
const userRouter = require("./user.routes");
const adminRouter = require("./admin.routes");
const dictRouter = require("./dict.routes");
const topicRouter = require("./topic.routes");

router.use("/dict", dictRouter);
router.use("/author", authorRouter);
router.use("/users", userRouter);
router.use("/admin", adminRouter);
router.use("/topic", topicRouter);

module.exports = router;
