const { StatusCodes } = require("http-status-codes");
const roleService = require("../services/roleService");

// Create a new role
async function createRole(req, res, next) {
  try {
    const role = await roleService.create(req.body);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Role created successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
}

// Get all roles with optional filters and pagination
async function getAllRoles(req, res, next) {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const pagination = {
      skip: (page - 1) * limit,
      take: parseInt(limit),
    };

    const result = await roleService.findAll(filters, pagination);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Roles retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// Get a role by ID
async function getRoleById(req, res, next) {
  try {
    const { id } = req.params;
    const role = await roleService.findById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Role retrieved successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
}

// Update a role
async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const role = await roleService.update(id, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Role updated successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
}

// Delete a role
async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    await roleService.delete(id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Get all permissions
async function getAllPermissions(req, res, next) {
  try {
    const permissions = await roleService.getPermissions();
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Permissions retrieved successfully",
      data: permissions,
    });
  } catch (error) {
    next(error);
  }
}

// Add permission to role
async function addPermissionToRole(req, res, next) {
  try {
    const { roleId, permissionId } = req.params;
    const result = await roleService.addPermissionToRole(roleId, permissionId);
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

// Remove permission from role
async function removePermissionFromRole(req, res, next) {
  try {
    const { roleId, permissionId } = req.params;
    const result = await roleService.removePermissionFromRole(
      roleId,
      permissionId
    );
    res.status(StatusCodes.OK).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getAllPermissions,
  addPermissionToRole,
  removePermissionFromRole,
};
