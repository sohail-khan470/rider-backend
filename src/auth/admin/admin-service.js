const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET; // move this to .env
const TOKEN_EXPIRES_IN = "1d"; // token validity

class AdminService {
  async register({ email, password }) {
    const existingAdmin = await prisma.superAdmin.findUnique({
      where: { email },
    });
    if (existingAdmin) {
      throw new Error("Email already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.superAdmin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = this._generateToken(admin.id, admin.email);
    return { admin, token };
  }

  async login({ email, password }) {
    const admin = await prisma.superAdmin.findUnique({ where: { email } });
    if (!admin) {
      throw new Error("Invalid email or password.");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      throw new Error("Invalid email or password.");
    }

    const token = this._generateToken(admin.id, admin.email);
    return { admin, token };
  }

  _generateToken(id, email) {
    return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  }

  async getAllAdmins() {
    return await prisma.superAdmin.findMany();
  }

  async getAdminById(id) {
    return await prisma.superAdmin.findUnique({ where: { id } });
  }

  async updateAdmin(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return await prisma.superAdmin.update({
      where: { id },
      data,
    });
  }

  async deleteAdmin(id) {
    await prisma.superAdmin.delete({ where: { id } });
    return true;
  }
}

module.exports = new AdminService();
