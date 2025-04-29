const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Clean existing data (if you want to start fresh)
  await cleanDatabase();

  // Seed SuperAdmin
  await seedSuperAdmin();

  // Seed Companies
  const companies = await seedCompanies();

  // Seed Company Admins
  await seedCompanyAdmins(companies);

  // Seed Staff Roles
  const roles = await seedStaffRoles();

  // Seed Staff
  await seedStaff(companies, roles);

  // Seed Drivers
  const drivers = await seedDrivers(companies);

  // Seed Driver Locations
  await seedDriverLocations(drivers);

  // Seed Driver Availabilities
  await seedDriverAvailabilities(drivers);

  // Seed Customers
  const customers = await seedCustomers(companies);

  // Seed Bookings
  await seedBookings(customers, drivers, companies);

  console.log("Database seeding completed successfully!");
}

async function cleanDatabase() {
  console.log("Cleaning database...");

  // Delete in the correct order to avoid foreign key constraint errors
  await prisma.booking.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.driverAvailability.deleteMany({});
  await prisma.driver.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.staff.deleteMany({});
  await prisma.staffRole.deleteMany({});
  await prisma.companyAdmin.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.superAdmin.deleteMany({});

  console.log("Database cleaned.");
}

async function seedSuperAdmin() {
  console.log("Seeding SuperAdmin...");

  await prisma.superAdmin.create({
    data: {
      email: "admin@ridemaster.com",
      password: await hashPassword("SuperAdmin123!"),
    },
  });

  console.log("✅ SuperAdmin seeded");
}

async function seedCompanies() {
  console.log("Seeding Companies...");

  const companies = [
    {
      name: "RideFast Taxi",
      email: "admin@ridefast.com",
      password: await hashPassword("RideFast2025!"),
      isApproved: true,
      timezone: "America/New_York",
    },
    {
      name: "City Cabs Inc.",
      email: "admin@citycabs.com",
      password: await hashPassword("CityCabs2025!"),
      isApproved: true,
      timezone: "America/Chicago",
    },
    {
      name: "Royal Transit",
      email: "admin@royaltransit.com",
      password: await hashPassword("Royal2025!"),
      isApproved: true,
      timezone: "America/Los_Angeles",
    },
    {
      name: "Green Rides",
      email: "admin@greenrides.com",
      password: await hashPassword("Green2025!"),
      isApproved: false,
      timezone: "Europe/London",
    },
    {
      name: "Eagle Transportation",
      email: "admin@eagletransport.com",
      password: await hashPassword("Eagle2025!"),
      isApproved: true,
      timezone: "Australia/Sydney",
    },
  ];

  const createdCompanies = [];

  for (const company of companies) {
    const createdCompany = await prisma.company.create({
      data: company,
    });
    createdCompanies.push(createdCompany);
  }

  console.log(`✅ ${createdCompanies.length} Companies seeded`);
  return createdCompanies;
}

async function seedCompanyAdmins(companies) {
  console.log("Seeding Company Admins...");

  const admins = [
    {
      name: "John Smith",
      email: "john@ridefast.com",
      password: await hashPassword("Admin2025!"),
      companyId: companies[0].id,
    },
    {
      name: "Maria Garcia",
      email: "maria@citycabs.com",
      password: await hashPassword("Admin2025!"),
      companyId: companies[1].id,
    },
    {
      name: "David Chen",
      email: "david@royaltransit.com",
      password: await hashPassword("Admin2025!"),
      companyId: companies[2].id,
    },
    {
      name: "Sarah Johnson",
      email: "sarah@greenrides.com",
      password: await hashPassword("Admin2025!"),
      companyId: companies[3].id,
    },
    {
      name: "Michael Brown",
      email: "michael@eagletransport.com",
      password: await hashPassword("Admin2025!"),
      companyId: companies[4].id,
    },
  ];

  for (const admin of admins) {
    await prisma.companyAdmin.create({
      data: admin,
    });
  }

  console.log(`✅ ${admins.length} Company Admins seeded`);
}

async function seedStaffRoles() {
  console.log("Seeding Staff Roles...");

  const roles = [
    { name: "Manager" },
    { name: "Dispatcher" },
    { name: "Customer Support" },
    { name: "Finance" },
    { name: "Operations" },
  ];

  const createdRoles = [];

  for (const role of roles) {
    const createdRole = await prisma.staffRole.create({
      data: role,
    });
    createdRoles.push(createdRole);
  }

  console.log(`✅ ${createdRoles.length} Staff Roles seeded`);
  return createdRoles;
}

async function seedStaff(companies, roles) {
  console.log("Seeding Staff...");

  const staff = [
    // RideFast Taxi staff
    {
      name: "Jessica Williams",
      email: "jessica@ridefast.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[0].id, // Manager
      companyId: companies[0].id,
    },
    {
      name: "Robert Davis",
      email: "robert@ridefast.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[1].id, // Dispatcher
      companyId: companies[0].id,
    },
    {
      name: "Emily Taylor",
      email: "emily@ridefast.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[2].id, // Customer Support
      companyId: companies[0].id,
    },

    // City Cabs Inc. staff
    {
      name: "Thomas Wilson",
      email: "thomas@citycabs.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[0].id, // Manager
      companyId: companies[1].id,
    },
    {
      name: "Lisa Rodriguez",
      email: "lisa@citycabs.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[3].id, // Finance
      companyId: companies[1].id,
    },

    // Royal Transit staff
    {
      name: "Kevin Lee",
      email: "kevin@royaltransit.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[4].id, // Operations
      companyId: companies[2].id,
    },
    {
      name: "Michelle Kim",
      email: "michelle@royaltransit.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[2].id, // Customer Support
      companyId: companies[2].id,
    },

    // Green Rides staff
    {
      name: "Daniel Martin",
      email: "daniel@greenrides.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[1].id, // Dispatcher
      companyId: companies[3].id,
    },

    // Eagle Transportation staff
    {
      name: "Amanda Clark",
      email: "amanda@eagletransport.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[0].id, // Manager
      companyId: companies[4].id,
    },
    {
      name: "Christopher White",
      email: "chris@eagletransport.com",
      password: await hashPassword("Staff2025!"),
      roleId: roles[1].id, // Dispatcher
      companyId: companies[4].id,
    },
  ];

  for (const member of staff) {
    await prisma.staff.create({
      data: member,
    });
  }

  console.log(`✅ ${staff.length} Staff members seeded`);
}

async function seedDrivers(companies) {
  console.log("Seeding Drivers...");

  // Create an array of driver vehicle types
  const vehicleTypes = [
    "Toyota Camry Hybrid - Sedan",
    "Honda Accord - Sedan",
    "Tesla Model 3 - Electric Sedan",
    "Ford Explorer - SUV",
    "Chevrolet Suburban - SUV",
    "Mercedes-Benz E-Class - Premium Sedan",
    "Toyota Sienna - Minivan",
    "BMW X5 - Premium SUV",
    "Lexus ES - Premium Sedan",
    "Hyundai Sonata - Sedan",
    "Kia Telluride - SUV",
    "Honda Odyssey - Minivan",
    "Ford Escape Hybrid - Compact SUV",
    "Toyota RAV4 - Compact SUV",
    "Tesla Model Y - Electric SUV",
  ];

  const drivers = [];
  const driverStatuses = ["offline", "online", "on_trip"];

  // Generate 5-8 drivers for each company
  for (const company of companies) {
    const driverCount = Math.floor(Math.random() * 4) + 5; // 5 to 8 drivers

    for (let i = 0; i < driverCount; i++) {
      const firstName = getRandomFirstName();
      const lastName = getRandomLastName();
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(
        Math.random() * 100
      )}@driver.com`;
      const phone = generateRandomPhone();
      const vehicle =
        vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const status =
        driverStatuses[Math.floor(Math.random() * driverStatuses.length)];

      const driver = await prisma.driver.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone,
          status: status,
          vehicleInfo: vehicle,
          companyId: company.id,
        },
      });

      drivers.push(driver);
    }
  }

  console.log(`✅ ${drivers.length} Drivers seeded`);
  return drivers;
}

async function seedDriverLocations(drivers) {
  console.log("Seeding Driver Locations...");

  const locations = [];

  // City coordinates (approximate centers)
  const cityCenters = [
    { city: "New York", lat: 40.7128, lng: -74.006 },
    { city: "Chicago", lat: 41.8781, lng: -87.6298 },
    { city: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    { city: "London", lat: 51.5074, lng: -0.1278 },
    { city: "Sydney", lat: -33.8688, lng: 151.2093 },
  ];

  // Assign each driver a location
  for (let i = 0; i < drivers.length; i++) {
    // Pick a city center based on the index
    const cityIndex = i % cityCenters.length;
    const cityCenter = cityCenters[cityIndex];

    // Add random offset (±0.05 degrees = few miles/km)
    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;

    const location = await prisma.location.create({
      data: {
        driverId: drivers[i].id,
        lat: cityCenter.lat + latOffset,
        lng: cityCenter.lng + lngOffset,
        updatedAt: new Date(),
      },
    });

    locations.push(location);
  }

  console.log(`✅ ${locations.length} Driver Locations seeded`);
}

async function seedDriverAvailabilities(drivers) {
  console.log("Seeding Driver Availabilities...");

  const availabilities = [];

  // Generate availabilities for each driver
  for (const driver of drivers) {
    // Create 5-7 availability slots for each driver
    const slots = Math.floor(Math.random() * 3) + 5; // 5 to 7 slots

    for (let i = 0; i < slots; i++) {
      // Get today's date
      const today = new Date();

      // Generate dates within the next 7 days
      const dayOffset = Math.floor(Math.random() * 7); // 0 to 6 days from now
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      // Set random start hour between 6:00 AM and 6:00 PM
      const startHour = Math.floor(Math.random() * 12) + 6; // 6 AM to 6 PM

      // Create start time
      const startTime = new Date(date);
      startTime.setHours(startHour, 0, 0, 0); // Set to exact hour, 0 minutes

      // Create end time (4-8 hours after start time)
      const endTime = new Date(startTime);
      const hoursToAdd = Math.floor(Math.random() * 5) + 4; // 4 to 8 hours
      endTime.setHours(endTime.getHours() + hoursToAdd);

      const availability = await prisma.driverAvailability.create({
        data: {
          driverId: driver.id,
          startTime: startTime,
          endTime: endTime,
        },
      });

      availabilities.push(availability);
    }
  }

  console.log(`✅ ${availabilities.length} Driver Availabilities seeded`);
}

async function seedCustomers(companies) {
  console.log("Seeding Customers...");

  const customers = [];

  // Generate 10-15 customers for each company
  for (const company of companies) {
    const customerCount = Math.floor(Math.random() * 6) + 10; // 10 to 15 customers

    for (let i = 0; i < customerCount; i++) {
      const firstName = getRandomFirstName();
      const lastName = getRandomLastName();
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(
        Math.random() * 1000
      )}@example.com`;
      const phone = generateRandomPhone();

      const customer = await prisma.customer.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone,
          companyId: company.id,
        },
      });

      customers.push(customer);
    }
  }

  console.log(`✅ ${customers.length} Customers seeded`);
  return customers;
}

async function seedBookings(customers, drivers, companies) {
  console.log("Seeding Bookings...");

  const bookings = [];
  const bookingStatuses = [
    "pending",
    "accepted",
    "ongoing",
    "completed",
    "cancelled",
  ];

  // City locations for pickup and dropoff
  const cityLocations = {
    "New York": [
      "JFK Airport",
      "LaGuardia Airport",
      "Grand Central Terminal",
      "Times Square",
      "Central Park",
      "Empire State Building",
      "Brooklyn Bridge",
      "Wall Street",
      "The Met Museum",
      "One World Trade Center",
      "Barclays Center",
      "Madison Square Garden",
    ],
    Chicago: [
      "O'Hare Airport",
      "Midway Airport",
      "Willis Tower",
      "Navy Pier",
      "Millennium Park",
      "Wrigley Field",
      "The Art Institute",
      "Magnificent Mile",
      "Grant Park",
      "United Center",
      "Chicago Riverwalk",
      "Lincoln Park Zoo",
    ],
    "Los Angeles": [
      "LAX Airport",
      "Hollywood Walk of Fame",
      "Universal Studios",
      "Griffith Observatory",
      "Santa Monica Pier",
      "Venice Beach",
      "The Getty Center",
      "Dodger Stadium",
      "Hollywood Sign",
      "Rodeo Drive",
      "Staples Center",
      "Beverly Hills",
    ],
    London: [
      "Heathrow Airport",
      "Gatwick Airport",
      "Buckingham Palace",
      "London Eye",
      "Tower Bridge",
      "Big Ben",
      "British Museum",
      "Oxford Street",
      "Piccadilly Circus",
      "Camden Market",
      "Westminster Abbey",
      "Hyde Park",
    ],
    Sydney: [
      "Sydney Airport",
      "Sydney Opera House",
      "Bondi Beach",
      "Darling Harbour",
      "Sydney Harbour Bridge",
      "Taronga Zoo",
      "Royal Botanic Garden",
      "The Rocks",
      "Queen Victoria Building",
      "Manly Beach",
      "Circular Quay",
      "Sydney Tower Eye",
    ],
  };

  // Generate bookings
  // 1. Loop through customers
  // 2. Create 0-5 bookings for each customer
  for (const customer of customers) {
    const bookingCount = Math.floor(Math.random() * 6); // 0 to 5 bookings per customer

    for (let i = 0; i < bookingCount; i++) {
      // Get the matching company for this customer
      const company = companies.find((c) => c.id === customer.companyId);

      // Get drivers for this company
      const companyDrivers = drivers.filter((d) => d.companyId === company.id);

      // Random driver (or null for pending bookings)
      const randomStatus =
        bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      let driverId = null;

      // Assign driver for non-pending and non-cancelled bookings
      if (
        randomStatus !== "pending" &&
        randomStatus !== "cancelled" &&
        companyDrivers.length > 0
      ) {
        const randomDriver =
          companyDrivers[Math.floor(Math.random() * companyDrivers.length)];
        driverId = randomDriver.id;
      }

      // Select a city based on company id (just for the sake of mapping companies to cities)
      const cities = Object.keys(cityLocations);
      const cityIndex = company.id % cities.length;
      const city = cities[cityIndex];
      const locations = cityLocations[city];

      // Random pickup and dropoff
      const pickup = locations[Math.floor(Math.random() * locations.length)];
      let dropoff;
      do {
        dropoff = locations[Math.floor(Math.random() * locations.length)];
      } while (dropoff === pickup); // Ensure pickup and dropoff are different

      // Random fare for non-pending bookings
      let fare = null;
      if (randomStatus !== "pending") {
        fare = parseFloat((10 + Math.random() * 40).toFixed(2)); // $10.00 to $50.00
      }

      // Random booking date in the past 30 days
      const requestedAt = new Date();
      requestedAt.setDate(
        requestedAt.getDate() - Math.floor(Math.random() * 30)
      );

      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          driverId: driverId,
          companyId: company.id,
          pickup: pickup,
          dropoff: dropoff,
          status: randomStatus,
          fare: fare,
          requestedAt: requestedAt,
        },
      });

      bookings.push(booking);
    }
  }

  console.log(`✅ ${bookings.length} Bookings seeded`);
}

// Helper functions

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

function getRandomFirstName() {
  const firstNames = [
    "James",
    "John",
    "Robert",
    "Michael",
    "William",
    "David",
    "Richard",
    "Joseph",
    "Thomas",
    "Christopher",
    "Mary",
    "Patricia",
    "Jennifer",
    "Linda",
    "Elizabeth",
    "Barbara",
    "Susan",
    "Jessica",
    "Sarah",
    "Karen",
    "Daniel",
    "Matthew",
    "Anthony",
    "Mark",
    "Donald",
    "Steven",
    "Paul",
    "Andrew",
    "Joshua",
    "Kenneth",
    "Nancy",
    "Lisa",
    "Betty",
    "Margaret",
    "Sandra",
    "Ashley",
    "Kimberly",
    "Emily",
    "Donna",
    "Michelle",
    "Luis",
    "Carlos",
    "Juan",
    "Miguel",
    "Jose",
    "Sofia",
    "Isabella",
    "Valentina",
    "Camila",
    "Lucia",
    "Wei",
    "Jin",
    "Mei",
    "Yong",
    "Jie",
    "Li",
    "Na",
    "Min",
    "Xiu",
    "Hui",
  ];

  return firstNames[Math.floor(Math.random() * firstNames.length)];
}

function getRandomLastName() {
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Jones",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
    "Thomas",
    "Jackson",
    "White",
    "Harris",
    "Martin",
    "Thompson",
    "Garcia",
    "Martinez",
    "Robinson",
    "Clark",
    "Rodriguez",
    "Lewis",
    "Lee",
    "Walker",
    "Hall",
    "Allen",
    "Young",
    "Hernandez",
    "King",
    "Wright",
    "Lopez",
    "Hill",
    "Scott",
    "Green",
    "Adams",
    "Baker",
    "Gonzalez",
    "Nelson",
    "Carter",
    "Mitchell",
    "Perez",
    "Roberts",
    "Turner",
    "Phillips",
    "Campbell",
    "Parker",
    "Evans",
    "Edwards",
    "Collins",
    "Chen",
    "Yang",
    "Li",
    "Wang",
    "Zhang",
    "Liu",
    "Singh",
    "Patel",
    "Kim",
    "Park",
  ];

  return lastNames[Math.floor(Math.random() * lastNames.length)];
}

function generateRandomPhone() {
  let phone = "+1";

  // Area code (3 digits)
  for (let i = 0; i < 3; i++) {
    phone += Math.floor(Math.random() * 10);
  }

  phone += "-";

  // First part (3 digits)
  for (let i = 0; i < 3; i++) {
    phone += Math.floor(Math.random() * 10);
  }

  phone += "-";

  // Second part (4 digits)
  for (let i = 0; i < 4; i++) {
    phone += Math.floor(Math.random() * 10);
  }

  return phone;
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma Client at the end
    await prisma.$disconnect();
  });
