const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const prisma = new PrismaClient();

// Validation schemas
const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  timezone: z.string().optional().default("UTC"),
});

const updateCompanySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  isApproved: z.boolean().optional(),
  timezone: z.string().optional(),
});

class CompanyService {
  async create(data) {
    try {
      // Validate input data
      const validatedData = createCompanySchema.parse(data);

      // Check if company with email already exists
      const existingCompany = await prisma.company.findUnique({
        where: { email: validatedData.email },
      });

      if (existingCompany) {
        throw new Error("Company with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create company
      const company = await prisma.company.create({
        data: {
          ...validatedData,
          password: hashedPassword,
        },
      });

      // Remove password from response
      const { password, ...companyWithoutPassword } = company;
      return companyWithoutPassword;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
      throw error;
    }
  }

  async findAll(filters = {}, pagination = { skip: 0, take: 10 }) {
    const companies = await prisma.company.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        name: true,
        email: true,
        isApproved: true,
        createdAt: true,
        timezone: true,
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
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
      },
    };
  }

  async findById(id) {
    console.log("company service $$$");
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
      // Validate input data
      const validatedData = updateCompanySchema.parse(data);

      // If updating email, check if it's already taken
      if (validatedData.email) {
        const existingCompany = await prisma.company.findFirst({
          where: {
            email: validatedData.email,
            id: { not: Number(id) },
          },
        });

        if (existingCompany) {
          throw new Error("Email is already taken by another company");
        }
      }

      // Hash password if provided
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 10);
      }

      // Update company
      const company = await prisma.company.update({
        where: { id: Number(id) },
        data: validatedData,
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
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error: ${error.errors.map((e) => e.message).join(", ")}`
        );
      }
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
      const company = await prisma.company.update({
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
}

module.exports = new CompanyService();
