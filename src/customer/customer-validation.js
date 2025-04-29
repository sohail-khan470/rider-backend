// src/customer/customer-validation.js
const { body } = require("express-validator");

const customerCreateValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("phone").isMobilePhone().withMessage("Must be a valid phone number"),
  body("companyId").isInt().withMessage("Company ID must be an integer"),
];

module.exports = { customerCreateValidation };
