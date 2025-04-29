// src/auth/super-admin/admin-validation.js
const { body } = require("express-validator");

const superAdminCreateValidation = [
  body("email").isEmail().withMessage("Must be a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

module.exports = { superAdminCreateValidation };
