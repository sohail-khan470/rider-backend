const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AddressService {
  // Create a new company address
  async create(addressData) {
    try {
      const address = await prisma.companyAddress.create({
        data: addressData,
        include: {
          company: true,
        },
      });
      return address;
    } catch (error) {
      throw new Error(`Failed to create address: ${error.message}`);
    }
  }

  // Get all addresses with optional filters
  async findAll(filters = {}) {
    try {
      const where = {};

      if (filters.companyId) {
        where.companyId = parseInt(filters.companyId);
      }

      if (filters.city) {
        where.city = {
          contains: filters.city,
          mode: "insensitive",
        };
      }

      if (filters.state) {
        where.state = {
          contains: filters.state,
          mode: "insensitive",
        };
      }

      if (filters.country) {
        where.country = {
          contains: filters.country,
          mode: "insensitive",
        };
      }

      if (filters.isPrimary !== undefined) {
        where.isPrimary = filters.isPrimary === "true";
      }

      const addresses = await prisma.companyAddress.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              isApproved: true,
            },
          },
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      });

      return {
        data: addresses,
        count: addresses.length,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve addresses: ${error.message}`);
    }
  }

  // Get address by ID
  async findById(id) {
    try {
      const address = await prisma.companyAddress.findUnique({
        where: { id: parseInt(id) },
        include: {
          company: true,
        },
      });

      if (!address) {
        throw new Error("Address not found");
      }

      return address;
    } catch (error) {
      throw new Error(`Failed to retrieve address: ${error.message}`);
    }
  }

  // Get addresses by company ID
  async findByCompanyId(companyId) {
    try {
      const addresses = await prisma.companyAddress.findMany({
        where: { companyId: parseInt(companyId) },
        include: {
          company: true,
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
      });

      return addresses;
    } catch (error) {
      throw new Error(
        `Failed to retrieve addresses by company: ${error.message}`
      );
    }
  }

  // Get primary address by company ID
  async findPrimaryByCompanyId(companyId) {
    try {
      const address = await prisma.companyAddress.findFirst({
        where: {
          companyId: parseInt(companyId),
          isPrimary: true,
        },
        include: {
          company: true,
        },
      });

      return address;
    } catch (error) {
      throw new Error(`Failed to retrieve primary address: ${error.message}`);
    }
  }

  // Update address
  async update(id, updateData) {
    try {
      const existingAddress = await prisma.companyAddress.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingAddress) {
        throw new Error("Address not found");
      }

      // If setting as primary, unset other primary addresses for the same company
      if (updateData.isPrimary === true) {
        await prisma.companyAddress.updateMany({
          where: {
            companyId: existingAddress.companyId,
            id: { not: parseInt(id) },
          },
          data: { isPrimary: false },
        });
      }

      const updatedAddress = await prisma.companyAddress.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          company: true,
        },
      });

      return updatedAddress;
    } catch (error) {
      throw new Error(`Failed to update address: ${error.message}`);
    }
  }

  // Delete address
  async delete(id) {
    try {
      const existingAddress = await prisma.companyAddress.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingAddress) {
        throw new Error("Address not found");
      }

      await prisma.companyAddress.delete({
        where: { id: parseInt(id) },
      });

      return { message: "Address deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete address: ${error.message}`);
    }
  }

  // Set primary address
  async setPrimary(id) {
    try {
      const existingAddress = await prisma.companyAddress.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingAddress) {
        throw new Error("Address not found");
      }

      // Unset other primary addresses for the same company
      await prisma.companyAddress.updateMany({
        where: {
          companyId: existingAddress.companyId,
          id: { not: parseInt(id) },
        },
        data: { isPrimary: false },
      });

      // Set this address as primary
      const updatedAddress = await prisma.companyAddress.update({
        where: { id: parseInt(id) },
        data: { isPrimary: true },
        include: {
          company: true,
        },
      });

      return updatedAddress;
    } catch (error) {
      throw new Error(`Failed to set primary address: ${error.message}`);
    }
  }
}

module.exports = new AddressService();
