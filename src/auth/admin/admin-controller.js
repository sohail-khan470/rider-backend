// admin-controller.js
const adminService = require("./admin-service");
const { StatusCodes } = require("http-status-codes");

const login = async (req, res) => {
  try {
    const admin = await adminService.login(req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      error: {},
      data: admin,
      message: "Successfully logged in",
    });
  } catch (error) {
    console.log;
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error,
      data: null,
      message: "Failed to login",
    });
  }
};

const createAdmin = async (req, res) => {
  try {
    const admin = await adminService.register(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      error: {},
      data: admin,
      message: "Successfully created admin",
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error,
      data: null,
      message: "Failed to create admin",
    });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminService.getAllAdmins();
    res.status(StatusCodes.OK).json({
      success: true,
      error: {},
      data: admins,
      message: "Successfully fetched all admins",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error,
      data: null,
      message: "Failed to fetch admins",
    });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await adminService.getAdminById(Number(req.params.id));
    if (!admin) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: { message: "Admin not found" },
        data: null,
        message: "Admin not found",
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      error: {},
      data: admin,
      message: "Successfully fetched admin",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error,
      data: null,
      message: "Failed to fetch admin",
    });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const admin = await adminService.updateAdmin(
      Number(req.params.id),
      req.body
    );
    res.status(StatusCodes.OK).json({
      success: true,
      error: {},
      data: admin,
      message: "Successfully updated admin",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error,
      data: null,
      message: "Failed to update admin",
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    await adminService.deleteAdmin(Number(req.params.id));
    res.status(StatusCodes.OK).json({
      success: true,
      error: {},
      data: null,
      message: "Successfully deleted admin",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error,
      data: null,
      message: "Failed to delete admin",
    });
  }
};

module.exports = {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  login,
};
