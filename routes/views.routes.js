const { createViewPage } = require("../helpers/create.view.page");
const topicsModel = require("../schemas/Topic");
const authorModel = require("../schemas/Author");
const dictModel = require("../schemas/Dict");
const router = require("express").Router();

router.get("/", (req, res) => {
  res.render(createViewPage("index"), {
    title: "Asosiy sahifa",
    isHome: true,
  });
});

router.get("/dictionary", async (req, res) => {
  let dictionary = await dictModel.find().lean();
  console.log(dictionary);
  res.render(createViewPage("dictionary"), {
    title: "Lugatlar",
    isDict: true,
    dictionary,
  });
});

router.get("/authors", async (req, res) => {
  let authors = await authorModel.find().lean();
  console.log(authors);
  res.render(createViewPage("authors"), {
    title: "Authors",
    isAuthor: true,
    authors,
  });
});

router.get("/topics", async (req, res) => {
  let topics = await topicsModel.find().lean();
  console.log(topics);
  res.render(createViewPage("topics"), {
    title: "Maqolalar",
    isTopic: true,
    topics,
  });
});

router.get("/login", (req, res) => {
  res.render(createViewPage("login"), {
    title: "Tizimga kirish",
    isLogin: true,
  });
});

module.exports = router;
