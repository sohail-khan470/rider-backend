const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

class CompanyService {
  async create(data) {
    try {
      // Check if company with email already exists
      const existingCompany = await prisma.company.findUnique({
        where: { email: data.email },
      });

      if (existingCompany) {
        throw new Error("Company with this email already exists");
      }

      // Create company
      const company = await prisma.company.create({
        data: {
          ...data,
          timezone: data.timezone || "UTC",
        },
      });

      // Remove password from response
      const { password, ...companyWithoutPassword } = company;
      return companyWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters = {}) {
    const companies = await prisma.company.findMany({
      where: filters,
      include: {
        contact: true,
        addresses: true,
        media: true,
        profile: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        drivers: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
        customers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        bookings: {
          select: {
            id: true,
            status: true,
            requestedAt: true,
          },
        },
        _count: {
          select: {
            drivers: true,
            customers: true,
            users: true,
            bookings: true,
          },
        },
      },
    });

    const total = await prisma.company.count({ where: filters });

    return {
      data: companies,
      total,
    };
  }

  async findById(id) {
    const company = await prisma.company.findUnique({
      where: { id: Number(id) },
      include: {
        bookings: true,
        drivers: {
          include: {
            location: true,
            availability: true,
          },
        },
        customers: true,
        users: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            drivers: true,
            customers: true,
            users: true,
            bookings: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    return company;
  }

  async update(id, data) {
    try {
      // If updating email, check if it's already taken
      if (data.email) {
        const existingCompany = await prisma.company.findFirst({
          where: {
            email: data.email,
            id: { not: Number(id) },
          },
        });

        if (existingCompany) {
          throw new Error("Email is already taken by another company");
        }
      }

      // Hash password if provided
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const company = await prisma.company.update({
        where: { id: Number(id) },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          isApproved: true,
          createdAt: true,
          timezone: true,
        },
      });

      return company;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      await prisma.company.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "Company deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete company: ${error.message}`);
    }
  }

  async approveCompany(id) {
    try {
      await prisma.company.update({
        where: { id: Number(id) },
        data: { isApproved: true },
      });

      return { success: true, message: "Company approved successfully" };
    } catch (error) {
      throw new Error(`Failed to approve company: ${error.message}`);
    }
  }

  async authenticate(email, password) {
    const company = await prisma.company.findUnique({
      where: { email },
    });

    if (!company) {
      throw new Error("Invalid credentials");
    }

    const passwordMatch = await bcrypt.compare(password, company.password);

    if (!passwordMatch) {
      throw new Error("Invalid credentials");
    }

    if (!company.isApproved) {
      throw new Error("Your company account has not been approved yet");
    }

    const { password: _, ...companyWithoutPassword } = company;
    return companyWithoutPassword;
  }

  async getCustomerByCompany(companyId) {
    const customers = await prisma.customer.findMany({
      where: {
        companyId: Number(companyId),
      },
    });

    return customers;
  }

  async updateStaff(staffId, data) {
    try {
      const existingStaff = await prisma.user.findUnique({
        where: { id: Number(staffId) },
      });

      if (!existingStaff) {
        throw new Error("Staff not found");
      }

      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const updatedStaff = await prisma.user.update({
        where: { id: Number(staffId) },
        data,
        include: {
          role: true,
        },
      });

      return updatedStaff;
    } catch (error) {
      throw new Error(`Failed to update staff: ${error.message}`);
    }
  }

  async edit(id, data) {
    try {
      const company = await prisma.company.update({
        where: { id: Number(id) },
        data,
      });
      return company;
    } catch (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }
  }
}

module.exports = new CompanyService();
