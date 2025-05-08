const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");
const prisma = new PrismaClient();

// Validation schemas
const createCustomerSchema = z.object({
  name: z.string().min(2, "Customer name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  companyId: z.number().int().positive("Company ID must be a positive integer"),
});

const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Customer name must be at least 2 characters")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  companyId: z
    .number()
    .int()
    .positive("Company ID must be a positive integer")
    .optional(),
});

class CustomerService {
  async create(data) {
    try {
      // Validate input data
      const validatedData = createCustomerSchema.parse(data);

      // Check if customer with email already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { email: validatedData.email },
      });

      if (existingCustomer) {
        throw new Error("Customer with this email already exists");
      }

      // Check if company exists
      const company = await prisma.company.findUnique({
        where: { id: validatedData.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // Create customer
      const customer = await prisma.customer.create({
        data: validatedData,
      });

      return customer;
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
    const customers = await prisma.customer.findMany({
      where: filters,
      skip: pagination.skip,
      take: pagination.take,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const total = await prisma.customer.count({ where: filters });

    return {
      data: customers,
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
      },
    };
  }

  async findById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        bookings: {
          take: 5,
          orderBy: {
            requestedAt: "desc",
          },
        },
      },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    return customer;
  }

  async update(id, data) {
    try {
      // Validate input data
      const validatedData = updateCustomerSchema.parse(data);

      // If updating email, check if it's already taken
      if (validatedData.email) {
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            email: validatedData.email,
            id: { not: Number(id) },
          },
        });

        if (existingCustomer) {
          throw new Error("Email is already taken by another customer");
        }
      }

      // If updating company, check if it exists
      if (validatedData.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: validatedData.companyId },
        });

        if (!company) {
          throw new Error("Company not found");
        }
      }

      // Update customer
      const customer = await prisma.customer.update({
        where: { id: Number(id) },
        data: validatedData,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return customer;
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
      await prisma.customer.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "Customer deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  async getCustomerBookings(customerId, pagination = { skip: 0, take: 10 }) {
    const bookings = await prisma.booking.findMany({
      where: {
        customerId: Number(customerId),
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: {
        requestedAt: "desc",
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            vehicleInfo: true,
          },
        },
      },
    });

    const total = await prisma.booking.count({
      where: { customerId: Number(customerId) },
    });

    return {
      data: bookings,
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
      },
    };
  }
}

module.exports = new CustomerService();
