const bcrypt = require("bcryptjs");
const Joi = require("joi");
const prisma = require("../prismaClient"); // Prisma Client
const jwt = require("jsonwebtoken");

// Joi schema for validating company input
const companySchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Service for company registration
const registerCompany = async (companyData) => {
  // Validate the input
  const { error } = companySchema.validate(companyData);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  // Check if the company already exists
  const existingCompany = await prisma.company.findUnique({
    where: {
      email: companyData.email,
    },
  });
  if (existingCompany) {
    throw new Error("Company with this email already exists");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(companyData.password, 10);

  // Create the company record
  const newCompany = await prisma.company.create({
    data: {
      name: companyData.name,
      email: companyData.email,
      password: hashedPassword,
    },
  });

  return newCompany;
};

const loginCompany = async (email, password) => {
  // Validate input
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }

  // Find company
  const company = await prisma.company.findUnique({ where: { email } });
  if (!company) {
    throw new Error("Invalid email or password");
  }

  // Check password
  const isMatch = await bcrypt.compare(password, company.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = jwt.sign(
    {
      id: company.id,
      role: "company",
    },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );

  return { token, company };
};

module.exports = {
  registerCompany,
  loginCompany,
};
