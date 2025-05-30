const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ContactService {
  // Create a new company contact
  async create(contactData) {
    try {
      const contact = await prisma.companyContact.create({
        data: contactData,
        include: {
          company: true,
        },
      });
      return contact;
    } catch (error) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  }

  // Get all contacts with optional filters
  async findAll(filters = {}) {
    try {
      const where = {};

      if (filters.companyId) {
        where.companyId = parseInt(filters.companyId);
      }

      if (filters.email) {
        where.email = {
          contains: filters.email,
          mode: "insensitive",
        };
      }

      const contacts = await prisma.companyContact.findMany({
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
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        data: contacts,
        count: contacts.length,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve contacts: ${error.message}`);
    }
  }

  // Get contact by ID
  async findById(id) {
    try {
      const contact = await prisma.companyContact.findUnique({
        where: { id: parseInt(id) },
        include: {
          company: true,
        },
      });

      if (!contact) {
        throw new Error("Contact not found");
      }

      return contact;
    } catch (error) {
      throw new Error(`Failed to retrieve contact: ${error.message}`);
    }
  }

  // Get contact by company ID
  async findByCompanyId(companyId) {
    try {
      const contact = await prisma.companyContact.findUnique({
        where: { companyId: parseInt(companyId) },
        include: {
          company: true,
        },
      });

      return contact;
    } catch (error) {
      throw new Error(
        `Failed to retrieve contact by company: ${error.message}`
      );
    }
  }

  // Update contact
  async update(id, updateData) {
    try {
      const existingContact = await prisma.companyContact.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingContact) {
        throw new Error("Contact not found");
      }

      const updatedContact = await prisma.companyContact.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          company: true,
        },
      });

      return updatedContact;
    } catch (error) {
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  }

  // Delete contact
  async delete(id) {
    try {
      const existingContact = await prisma.companyContact.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingContact) {
        throw new Error("Contact not found");
      }

      await prisma.companyContact.delete({
        where: { id: parseInt(id) },
      });

      return { message: "Contact deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  }

  // Check if email already exists (excluding current contact if updating)
  //   async checkEmailExists(email, excludeId = null) {
  //     try {
  //       const where = { email };

  //       if (excludeId) {
  //         where.id = { not: parseInt(excludeId) };
  //       }

  //       const existingContact = await prisma.companyContact.findUnique({
  //         where,
  //       });

  //       return !!existingContact;
  //     } catch (error) {
  //       throw new Error(`Failed to check email existence: ${error.message}`);
  //     }
  //   }

  // Validate contact data
  //   validateContactData(data, isUpdate = false) {
  //     const errors = [];

  //     if (!isUpdate || data.companyId !== undefined) {
  //       if (!data.companyId) {
  //         errors.push("Company ID is required");
  //       }
  //     }

  //     if (!isUpdate || data.phone !== undefined) {
  //       if (!data.phone) {
  //         errors.push("Phone number is required");
  //       }
  //     }

  //     if (!isUpdate || data.email !== undefined) {
  //       if (!data.email) {
  //         errors.push("Email is required");
  //       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
  //         errors.push("Invalid email format");
  //       }
  //     }

  //     if (!isUpdate || data.website !== undefined) {
  //       if (!data.website) {
  //         errors.push("Website is required");
  //       }
  //     }

  //     return errors;
  //   }
}

module.exports = new ContactService();
