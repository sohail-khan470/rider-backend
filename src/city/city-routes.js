const express = require("express");
const router = express.Router();
const cityController = require("./city-controller");

// Create a new city
router.post("/", cityController.createCity);

// Get all cities (with pagination)
router.get("/", cityController.getAllCities);

// Search cities by name
router.get("/search", cityController.searchCities);

// Get a specific city by ID
router.get("/:id", cityController.getCityById);

// Update a city
router.put("/:id", cityController.updateCity);

// Delete a city
router.delete("/:id", cityController.deleteCity);

module.exports = router;
