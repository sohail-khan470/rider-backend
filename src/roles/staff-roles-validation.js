// src/roles/staff-roles-validation.js
const { body } = require("express-validator");

const staffRoleCreateValidation = [
  body("name").notEmpty().withMessage("Name is required"),
];

module.exports = { staffRoleCreateValidation };
