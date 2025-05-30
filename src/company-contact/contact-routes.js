const router = require("express").Router();

const contactController = require("./contact-controller");

router.post("/", contactController.createContact);
router.get("/", contactController.getAllContacts);
router.get("/:id", contactController.getContactById);
router.get("/company/:companyId", contactController.getContactByCompanyId);
router.put("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);
router.get("/me", contactController.getMyCompanyContact);

module.exports = router;
