// src/location/location-validation.js
const { body } = require("express-validator");

const locationCreateValidation = [
  body("driverId").isInt().withMessage("Driver ID must be an integer"),
  body("lat").isFloat().withMessage("Latitude must be a float"),
  body("lng").isFloat().withMessage("Longitude must be a float"),
];

module.exports = { locationCreateValidation };
