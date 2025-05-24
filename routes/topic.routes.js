const router = require("express").Router();

const {
  addTopic,
  findAll,
  findOne,
  updateById,
  removeById,
  logintopic,
  logouttopic,
  refreshtopicToken,
} = require("../controllers/topic.controller");

router.post("/create", addTopic);
router.post("/login", logintopic);
router.post("/logout", logouttopic);
router.get("/refresh", refreshtopicToken);
router.get("/all", findAll);
router.get("/create", findOne);
router.patch("/:id", updateById);
router.delete("/:id", removeById);

module.exports = router;
