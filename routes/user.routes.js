const router = require("express").Router();

const {
  adduser,
  findAll,
  findOne,
  updateById,
  removeById,
  loginuser,
  logoutuser,
  refreshuserToken,
  userActivate,
} = require("../controllers/user.controller");

router.post("/login", loginuser);
router.post("/create", adduser);
router.get("/logout", logoutuser);
router.get("/refresh", refreshuserToken);
router.get("/all", findAll);
router.get("/activate/:link", userActivate);
router.get("/:id", findOne);
router.patch("/:id", updateById);
router.delete("/:id", removeById);

module.exports = router;
