const { StatusCodes } = require("http-status-codes");
const CityService = require("./city-service");

// Create a new city
async function createCity(req, res, next) {
  try {
    const city = await CityService.createCity(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "City created successfully",
      data: city,
    });
  } catch (error) {
    next(error);
  }
}

// Get all cities with pagination
async function getAllCities(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await CityService.getAllCities({ page, limit });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Cities retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
}

// Get a city by ID
async function getCityById(req, res, next) {
  try {
    const { id } = req.params;
    const city = await CityService.getCityById(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "City retrieved successfully",
      data: city,
    });
  } catch (error) {
    next(error);
  }
}

// Update a city
async function updateCity(req, res, next) {
  try {
    const { id } = req.params;
    const city = await CityService.updateCity(id, req.body);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "City updated successfully",
      data: city,
    });
  } catch (error) {
    next(error);
  }
}

// Delete a city
async function deleteCity(req, res, next) {
  try {
    const { id } = req.params;
    await CityService.deleteCity(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "City deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Search cities by name
async function searchCities(req, res, next) {
  try {
    const { query } = req.query;
    const cities = await CityService.searchCities(query);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Cities search completed successfully",
      data: cities,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  deleteCity,
  searchCities,
};
