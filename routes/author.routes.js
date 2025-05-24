const router = require("express").Router();

const {
  addAuthor,
  findAll,
  findOne,
  updateById,
  removeById,
  loginAuthor,
  logoutAuthor,
  refreshAuthorToken,
  authorActivate,
} = require("../controllers/author.controller");

router.post("/login", loginAuthor);
router.post("/create", addAuthor);
router.get("/logout", logoutAuthor);
router.get("/refresh", refreshAuthorToken);
router.get("/all", findAll);
router.get("/activate/:link", authorActivate);
router.get("/:id", findOne);
router.patch("/:id", updateById);
router.delete("/:id", removeById);

module.exports = router;
