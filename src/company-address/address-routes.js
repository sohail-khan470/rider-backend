const router = require("express").Router();

const addressController = require("./address-controller");

router.post("/", addressController.createAddress);
router.get("/", addressController.getAllAddresses);
router.get("/:id", addressController.getAddressById);
router.put("/:id", addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
