const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CustomerService {
  async create(data) {
    try {
      if (!data.name || data.name.length < 2) {
        throw new Error("Customer name must be at least 2 characters");
      }

      if (!data.email || !this.validateEmail(data.email)) {
        throw new Error("Invalid email format");
      }

      if (!data.phone || data.phone.length < 10) {
        throw new Error("Phone number must be at least 10 characters");
      }

      if (
        !data.companyId ||
        !Number.isInteger(data.companyId) ||
        data.companyId <= 0
      ) {
        throw new Error("Company ID must be a positive integer");
      }

      const existingCustomer = await prisma.customer.findUnique({
        where: { email: data.email },
      });

      if (existingCustomer) {
        throw new Error("Customer with this email already exists");
      }

      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      const customer = await prisma.customer.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          companyId: data.companyId,
        },
      });

      return customer;
    } catch (error) {
      throw error;
    }
  }

  async findAll(filters = {}, pagination = { skip: 0, take: 10 }) {
    const newFilters = {
      ...filters,
      companyId: filters.companyId ? Number(filters.companyId) : undefined,
    };

    const { search, ...restFilters } = newFilters;
    const where = { ...restFilters };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
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
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      pagination: {
        total,
        page: Math.floor(pagination.skip / pagination.take) + 1,
        pageSize: pagination.take,
        totalPages: Math.ceil(total / pagination.take),
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
      if (data.name && data.name.length < 2) {
        throw new Error("Customer name must be at least 2 characters");
      }

      if (data.email && !this.validateEmail(data.email)) {
        throw new Error("Invalid email format");
      }

      if (data.phone && data.phone.length < 10) {
        throw new Error("Phone number must be at least 10 characters");
      }

      if (
        data.companyId &&
        (!Number.isInteger(data.companyId) || data.companyId <= 0)
      ) {
        throw new Error("Company ID must be a positive integer");
      }

      if (data.email) {
        const existingCustomer = await prisma.customer.findFirst({
          where: {
            email: data.email,
            id: { not: Number(id) },
          },
        });

        if (existingCustomer) {
          throw new Error("Email is already taken by another customer");
        }
      }

      if (data.companyId) {
        const company = await prisma.company.findUnique({
          where: { id: data.companyId },
        });

        if (!company) {
          throw new Error("Company not found");
        }
      }

      const customer = await prisma.customer.update({
        where: { id: Number(id) },
        data: data,
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

  async getCustomerByCompanyId(companyId) {
    const customers = await prisma.customer.findMany({
      where: { companyId: Number(companyId) },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return customers;
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

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

module.exports = new CustomerService();
