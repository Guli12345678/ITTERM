const router = require("express").Router();

const {
  addadmin,
  findAll,
  findOne,
  updateById,
  removeById,
  loginadmin,
  logoutadmin,
  refreshadminToken,
  adminActivate,
} = require("../controllers/admin.controller");

router.post("/login", loginadmin);
router.post("/create", addadmin);
router.get("/logout", logoutadmin);
router.get("/refresh", refreshadminToken);
router.get("/all", findAll);
router.get("/activate/:link", adminActivate);
router.get("/:id", findOne);
router.patch("/:id", updateById);
router.delete("/:id", removeById);

module.exports = router;
