const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

class CompanyService {
  async create(data) {
    try {
      const company = await prisma.company.create({
        data: {
          ...data,
          timezone: data.timezone || "UTC",
        },
      });

      return company;
    } catch (error) {
      throw new Error(`Failed to create company: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
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
    } catch (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const company = await prisma.company.findUnique({
        where: { id: Number(id) },
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

      if (!company) {
        throw new Error("Company not found");
      }

      return company;
    } catch (error) {
      throw new Error(`Failed to find company: ${error.message}`);
    }
  }

  async update(id, data) {
    try {
      const companyData = {};
      const transactionQueries = [];

      // Only include fields that are provided
      if (data.name !== undefined) companyData.name = data.name;
      if (data.timezone !== undefined) companyData.timezone = data.timezone;

      // Update company if there's data to update
      if (Object.keys(companyData).length > 0) {
        transactionQueries.push(
          prisma.company.update({
            where: { id: Number(id) },
            data: companyData,
          })
        );
      }

      // Handle contact data - use upsert instead of update
      if (data.contact) {
        transactionQueries.push(
          prisma.companyContact.upsert({
            where: { companyId: Number(id) },
            update: data.contact,
            create: {
              ...data.contact,
              companyId: Number(id),
            },
          })
        );
      }

      // Handle profile data - use upsert instead of update
      if (data.profile) {
        transactionQueries.push(
          prisma.companyProfile.upsert({
            where: { companyId: Number(id) },
            update: data.profile,
            create: {
              ...data.profile,
              companyId: Number(id),
            },
          })
        );
      }

      // Execute transaction if there are queries
      if (transactionQueries.length > 0) {
        await prisma.$transaction(transactionQueries);
      }

      // Return the updated company
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update company: ${error.message}`);
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
    try {
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
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getCustomerByCompany(companyId) {
    try {
      const customers = await prisma.customer.findMany({
        where: {
          companyId: Number(companyId),
        },
      });

      return customers;
    } catch (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
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
      const existingCompany = await prisma.company.findUnique({
        where: { id: Number(id) },
      });

      if (!existingCompany) {
        throw new Error("Company not found");
      }

      const company = await prisma.company.update({
        where: { id: Number(id) },
        data,
      });

      return company;
    } catch (error) {
      throw new Error(`Failed to edit company: ${error.message}`);
    }
  }
}

module.exports = new CompanyService();
