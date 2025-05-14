// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clean up existing data
  console.log("Cleaning up existing data...");
  await prisma.location.deleteMany({});
  await prisma.driverAvailability.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.superAdmin.deleteMany({});

  // Create SuperAdmin
  console.log("Creating super admin...");
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.superAdmin.create({
    data: {
      email: "superadmin@taxiapp.com",
      password: hashedPassword,
    },
  });

  // Create Cities
  console.log("Creating cities...");
  const cities = await Promise.all([
    prisma.city.create({ data: { name: "New York" } }),
    prisma.city.create({ data: { name: "Los Angeles" } }),
    prisma.city.create({ data: { name: "Chicago" } }),
    prisma.city.create({ data: { name: "Houston" } }),
    prisma.city.create({ data: { name: "Miami" } }),
  ]);

  // Create Permissions
  console.log("Creating permissions...");
  const permissions = await Promise.all([
    prisma.permission.create({ data: { name: "manage_users" } }),
    prisma.permission.create({ data: { name: "manage_drivers" } }),
    prisma.permission.create({ data: { name: "manage_customers" } }),
    prisma.permission.create({ data: { name: "manage_bookings" } }),
    prisma.permission.create({ data: { name: "view_reports" } }),
    prisma.permission.create({ data: { name: "view_dashboard" } }),
  ]);

  // Create Roles
  console.log("Creating roles...");
  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
      permissions: {
        create: permissions.map((permission) => ({
          permissionId: permission.id,
        })),
      },
    },
  });

  const dispatcherRole = await prisma.role.create({
    data: {
      name: "dispatcher",
      permissions: {
        create: [
          { permissionId: permissions[2].id }, // manage_customers
          { permissionId: permissions[3].id }, // manage_bookings
          { permissionId: permissions[5].id }, // view_dashboard
        ],
      },
    },
  });

  const analystRole = await prisma.role.create({
    data: {
      name: "analyst",
      permissions: {
        create: [
          { permissionId: permissions[4].id }, // view_reports
          { permissionId: permissions[5].id }, // view_dashboard
        ],
      },
    },
  });

  // Create Companies
  console.log("Creating companies...");
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Express Cab Co.",
        email: "admin@expresscab.com",
        isApproved: true,
        timezone: "America/New_York",
      },
    }),
    prisma.company.create({
      data: {
        name: "City Rides Inc.",
        email: "admin@cityrides.com",
        isApproved: true,
        timezone: "America/Los_Angeles",
      },
    }),
    prisma.company.create({
      data: {
        name: "Metro Taxi Service",
        email: "admin@metrotaxi.com",
        isApproved: false,
        timezone: "America/Chicago",
      },
    }),
  ]);

  // Create Users
  console.log("Creating users...");
  const users = [];
  for (const company of companies) {
    // Admin for each company
    users.push(
      await prisma.user.create({
        data: {
          name: `Admin ${company.name}`,
          email: `admin@${company.name.toLowerCase().replace(/\s+/g, "")}.com`,
          password: await bcrypt.hash("Password123", 10),
          companyId: company.id,
          roleId: adminRole.id,
        },
      })
    );

    // Dispatcher for each company
    users.push(
      await prisma.user.create({
        data: {
          name: `Dispatcher ${company.name}`,
          email: `dispatcher@${company.name
            .toLowerCase()
            .replace(/\s+/g, "")}.com`,
          password: await bcrypt.hash("Password123", 10),
          companyId: company.id,
          roleId: dispatcherRole.id,
        },
      })
    );

    // Analyst for each company
    users.push(
      await prisma.user.create({
        data: {
          name: `Analyst ${company.name}`,
          email: `analyst@${company.name
            .toLowerCase()
            .replace(/\s+/g, "")}.com`,
          password: await bcrypt.hash("Password123", 10),
          companyId: company.id,
          roleId: analystRole.id,
        },
      })
    );
  }

  // Create Drivers
  console.log("Creating drivers...");
  const drivers = [];
  const vehicleTypes = ["Sedan", "SUV", "Van", "Luxury Sedan", "Compact"];
  const driverStatuses = ["offline", "online", "on_trip"];

  for (const company of companies) {
    if (!company.isApproved) continue; // Skip unapproved companies

    // Create multiple drivers for each company
    for (let i = 0; i < 5; i++) {
      const driver = await prisma.driver.create({
        data: {
          name: `Driver ${i + 1} ${company.name}`,
          email: `driver${i + 1}@${company.name
            .toLowerCase()
            .replace(/\s+/g, "")}.com`,
          phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          status:
            driverStatuses[Math.floor(Math.random() * driverStatuses.length)],
          vehicleInfo: `${
            vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)]
          } - License: XYZ${Math.floor(1000 + Math.random() * 9000)}`,
          companyId: company.id,
          cityId: cities[Math.floor(Math.random() * cities.length)].id,
          timezone: company.timezone,
        },
      });
      drivers.push(driver);

      // Create location for each driver
      await prisma.location.create({
        data: {
          driverId: driver.id,
          lat: 40.7128 + (Math.random() - 0.5) * 0.1, // NYC with slight variations
          lng: -74.006 + (Math.random() - 0.5) * 0.1,
        },
      });

      // Create availability for each driver
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Morning shift
      await prisma.driverAvailability.create({
        data: {
          driverId: driver.id,
          startTime: new Date(today.setHours(8, 0, 0, 0)),
          endTime: new Date(today.setHours(16, 0, 0, 0)),
        },
      });

      // Evening shift for the next day
      await prisma.driverAvailability.create({
        data: {
          driverId: driver.id,
          startTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
          endTime: new Date(tomorrow.setHours(23, 59, 0, 0)),
        },
      });
    }
  }

  // Create Customers
  console.log("Creating customers...");
  const customers = [];
  for (const company of companies) {
    // Create multiple customers for each company
    for (let i = 0; i < 10; i++) {
      const companySlug = company.name.toLowerCase().replace(/\s+/g, "");
      const customer = await prisma.customer.create({
        data: {
          name: `Customer ${i + 1} ${company.name}`,
          email: `customer${i + 1}_${companySlug}@example.com`,
          phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          companyId: company.id,
        },
      });
      customers.push(customer);
    }
  }

  // Create Bookings
  console.log("Creating bookings...");
  const bookingStatuses = [
    "pending",
    "accepted",
    "ongoing",
    "completed",
    "cancelled",
  ];
  const locations = [
    "Airport Terminal 1",
    "Downtown Center",
    "Hotel Plaza",
    "Shopping Mall",
    "Business District",
    "University Campus",
    "Residential Area",
    "Train Station",
    "Convention Center",
  ];

  for (const company of companies) {
    if (!company.isApproved) continue; // Skip unapproved companies

    const companyDrivers = drivers.filter((d) => d.companyId === company.id);
    const companyCustomers = customers.filter(
      (c) => c.companyId === company.id
    );

    // Create multiple bookings for each company
    for (let i = 0; i < 20; i++) {
      const status =
        bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      const customer =
        companyCustomers[Math.floor(Math.random() * companyCustomers.length)];
      const driver =
        status === "pending"
          ? null
          : companyDrivers[Math.floor(Math.random() * companyDrivers.length)];

      const pickup = locations[Math.floor(Math.random() * locations.length)];
      const dropoff = locations[Math.floor(Math.random() * locations.length)];

      // Make sure pickup and dropoff are different
      const actualDropoff =
        pickup === dropoff
          ? locations[(locations.indexOf(dropoff) + 1) % locations.length]
          : dropoff;

      await prisma.booking.create({
        data: {
          customerId: customer.id,
          driverId: driver?.id || null,
          companyId: company.id,
          pickup,
          dropoff: actualDropoff,
          status,
          fare:
            status === "completed" ? Math.floor(20 + Math.random() * 50) : null,
          requestedAt: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ), // Random date in the last week
        },
      });
    }
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
