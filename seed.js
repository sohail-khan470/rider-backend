const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // SuperAdmin

  // Companies
  const companies = await prisma.company.createMany({
    data: [
      {
        name: "Company A",
        email: "companya@example.com",
        password: "password123",
      },
      {
        name: "Company B",
        email: "companyb@example.com",
        password: "password456",
      },
      {
        name: "Company C",
        email: "companyc@example.com",
        password: "password789",
      },
    ],
  });

  // Fetch created companies
  const companyA = await prisma.company.findUnique({
    where: { email: "companya@example.com" },
  });
  const companyB = await prisma.company.findUnique({
    where: { email: "companyb@example.com" },
  });
  const companyC = await prisma.company.findUnique({
    where: { email: "companyc@example.com" },
  });

  // Roles

  // Assign Permissions to Roles
  const adminRole = await prisma.role.findUnique({ where: { name: "Admin" } });
  const createPermission = await prisma.permission.findUnique({
    where: { name: "CreateBooking" },
  });

  await prisma.rolePermission.create({
    data: {
      roleId: adminRole.id,
      permissionId: createPermission.id,
    },
  });

  // Users
  const users = await prisma.user.createMany({
    data: [
      {
        name: "John Doe",
        email: "john@companya.com",
        password: "johnpassword",
        companyId: companyA.id,
        roleId: adminRole.id,
      },
      {
        name: "Jane Smith",
        email: "jane@companya.com",
        password: "janepassword",
        companyId: companyA.id,
        roleId: adminRole.id,
      },
    ],
  });

  // Drivers
  const drivers = await prisma.driver.createMany({
    data: [
      {
        name: "Driver 1",
        email: "driver1@example.com",
        phone: "1234567890",
        vehicleInfo: "Car A",
        companyId: companyB.id,
      },
      {
        name: "Driver 2",
        email: "driver2@example.com",
        phone: "0987654321",
        vehicleInfo: "Car B",
        companyId: companyB.id,
      },
    ],
  });

  // Customers
  const customers = await prisma.customer.createMany({
    data: [
      {
        name: "Customer 1",
        email: "customer1@example.com",
        phone: "1112223333",
        companyId: companyC.id,
      },
      {
        name: "Customer 2",
        email: "customer2@example.com",
        phone: "4445556666",
        companyId: companyC.id,
      },
    ],
  });

  // Bookings
  const customer1 = await prisma.customer.findUnique({
    where: { email: "customer1@example.com" },
  });
  const driver1 = await prisma.driver.findUnique({
    where: { email: "driver1@example.com" },
  });

  const bookings = await prisma.booking.createMany({
    data: [
      {
        customerId: customer1.id,
        driverId: driver1.id,
        companyId: companyC.id,
        pickup: "Location A",
        dropoff: "Location B",
        fare: 50.0,
        status: "accepted",
      },
      {
        customerId: customer1.id,
        driverId: null,
        companyId: companyC.id,
        pickup: "Location C",
        dropoff: "Location D",
        fare: 20.0,
        status: "pending",
      },
    ],
  });

  // Driver Availability
  const driverAvailability = await prisma.driverAvailability.createMany({
    data: [
      {
        driverId: driver1.id,
        startTime: new Date("2025-05-01T08:00:00.000Z"),
        endTime: new Date("2025-05-01T18:00:00.000Z"),
      },
    ],
  });

  // Locations
  const locations = await prisma.location.createMany({
    data: [
      { driverId: driver1.id, lat: 37.7749, lng: -122.4194 }, // Example coordinates
    ],
  });

  console.log("Database seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
