const express = require("express");
const router = express.Router();
const cityController = require("./city-controller");

router.post("/", cityController.createCity);

router.get("/", cityController.getAllCities);

router.get("/search", cityController.searchCities);

router.get("/:id", cityController.getCityById);

router.put("/:id", cityController.updateCity);

router.delete("/:id", cityController.deleteCity);

module.exports = router;
