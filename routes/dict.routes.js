const router = require("express").Router();

const {
  adddict,
  findAll,
  findOne,
  updateById,
  removeById,
  logindict,
  logoutdict,
  refreshdictToken,
} = require("../controllers/dict.controller");

router.post("/create", adddict);
router.post("/login", logindict);
router.post("/logout", logoutdict);
router.get("/refresh", refreshdictToken);
router.get("/all", findAll);
router.get("/:id", findOne);
router.patch("/:id", updateById);
router.delete("/:id", removeById);

module.exports = router;
