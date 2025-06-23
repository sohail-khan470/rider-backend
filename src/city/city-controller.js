const { StatusCodes } = require("http-status-codes");
const CityService = require("./city-service");

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

async function getAllCities(req, res, next) {
  try {
    const result = await CityService.getAllCities();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Cities retrieved successfully",
      result,
    });
  } catch (error) {
    next(error);
  }
}

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
