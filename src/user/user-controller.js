const { StatusCodes } = require("http-status-codes");
const userService = require("./user-service");

// Create a new user
async function createUser(req, res, next) {
  try {
    console.log("user-controller----------", req.body);
    const user = await userService.create(req.body.data);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// Get all users with filters and pagination
async function getAllUsers(req, res, next) {
  try {
    const { ...filters } = req.query;

    const result = await userService.findAll(filters);
    console.log(result);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

// Get user by ID
async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// Update user
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.update(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

// Delete user
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const result = await userService.delete(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

// Authenticate user
async function authenticateUser(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userService.authenticate(email, password);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Authentication successful",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminUsers(req, res, next) {
  try {
    const { companyId } = req.params;

    const admins = await userService.getAdmins(companyId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Admin users retrieved successfully",
      data: admins,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  authenticateUser,
  getAdminUsers,
};
