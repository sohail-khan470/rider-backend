const router = require("express").Router();
const { infoController } = require("../../controllers");
const homeRoutes = require("./home");

router.get("/info", infoController.info);

router.use("/home", homeRoutes);

module.exports = router;
