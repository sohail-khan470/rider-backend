// src/staff/staff-validation.js
const { body } = require("express-validator");

const staffCreateValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("roleId").isInt().withMessage("Role ID must be an integer"),
  body("companyId").isInt().withMessage("Company ID must be an integer"),
];

module.exports = { staffCreateValidation };
