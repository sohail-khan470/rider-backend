const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Hash password function
  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  // Create SuperAdmin
  const superAdmin = await prisma.superAdmin.create({
    data: {
      email: "admin@ridehub.com",
      password: await hashPassword("SuperAdmin123!"),
    },
  });

  // Create Cities
  const cities = await prisma.city.createMany({
    data: [
      // Italian Cities
      { name: "Rome" },
      { name: "Milan" },
      { name: "Naples" },
      { name: "Turin" },
      { name: "Florence" },
      { name: "Bologna" },
      { name: "Venice" },
      // German Cities
      { name: "Berlin" },
      { name: "Munich" },
      { name: "Hamburg" },
      { name: "Cologne" },
      { name: "Frankfurt" },
      { name: "Stuttgart" },
      { name: "Düsseldorf" },
    ],
  });

  // Get created cities
  const createdCities = await prisma.city.findMany();

  // Create Permissions
  const permissions = await prisma.permission.createMany({
    data: [
      { name: "CREATE_BOOKING" },
      { name: "VIEW_BOOKING" },
      { name: "UPDATE_BOOKING" },
      { name: "DELETE_BOOKING" },
      { name: "MANAGE_DRIVERS" },
      { name: "VIEW_REPORTS" },
      { name: "MANAGE_CUSTOMERS" },
      { name: "ADMIN_ACCESS" },
    ],
  });

  const createdPermissions = await prisma.permission.findMany();

  // Create Roles
  const adminRole = await prisma.role.create({
    data: {
      name: "ADMIN",
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: "MANAGER",
    },
  });

  const operatorRole = await prisma.role.create({
    data: {
      name: "OPERATOR",
    },
  });

  // Assign permissions to roles
  // Admin gets all permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Manager gets most permissions except ADMIN_ACCESS
  const managerPermissions = createdPermissions.filter(
    (p) => p.name !== "ADMIN_ACCESS"
  );
  for (const permission of managerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Operator gets basic permissions
  const operatorPermissions = createdPermissions.filter((p) =>
    [
      "CREATE_BOOKING",
      "VIEW_BOOKING",
      "UPDATE_BOOKING",
      "MANAGE_CUSTOMERS",
    ].includes(p.name)
  );
  for (const permission of operatorPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: operatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create Italian Companies
  const italianCompanies = [
    {
      name: "Roma Taxi Service",
      cityName: "Rome",
      timezone: "Europe/Rome",
      contact: {
        phone: "+39 06 3570",
        email: "info@romataxiservice.it",
        website: "https://www.romataxiservice.it",
      },
      address: {
        street: "Via del Corso, 123",
        city: "Rome",
        state: "Lazio",
        country: "Italy",
        postalCode: "00186",
      },
      profile: {
        description:
          "Leading taxi service in Rome with over 20 years of experience",
        mission:
          "To provide reliable and comfortable transportation throughout the Eternal City",
        vision: "To be the most trusted taxi service in Rome",
        values: "Reliability, Safety, Customer Service",
      },
    },
    {
      name: "Milano Express",
      cityName: "Milan",
      timezone: "Europe/Rome",
      contact: {
        phone: "+39 02 4040",
        email: "booking@milanoexpress.it",
        website: "https://www.milanoexpress.it",
      },
      address: {
        street: "Corso Buenos Aires, 45",
        city: "Milan",
        state: "Lombardy",
        country: "Italy",
        postalCode: "20124",
      },
      profile: {
        description:
          "Premium taxi and ride service in the fashion capital of Italy",
        mission: "Connecting Milan with style and efficiency",
        vision: "To revolutionize urban mobility in Milan",
        values: "Innovation, Style, Punctuality",
      },
    },
    {
      name: "Napoli Ride",
      cityName: "Naples",
      timezone: "Europe/Rome",
      contact: {
        phone: "+39 081 2020",
        email: "support@napoliride.it",
        website: "https://www.napoliride.it",
      },
      address: {
        street: "Via Toledo, 67",
        city: "Naples",
        state: "Campania",
        country: "Italy",
        postalCode: "80134",
      },
      profile: {
        description:
          "Your trusted partner for transportation in beautiful Naples",
        mission: "Making Naples accessible to everyone",
        vision: "To showcase Naples through excellent service",
        values: "Hospitality, Authenticity, Excellence",
      },
    },
  ];

  // Create German Companies
  const germanCompanies = [
    {
      name: "Berlin Taxi Union",
      cityName: "Berlin",
      timezone: "Europe/Berlin",
      contact: {
        phone: "+49 30 202020",
        email: "info@berlintaxiunion.de",
        website: "https://www.berlintaxiunion.de",
      },
      address: {
        street: "Unter den Linden, 10",
        city: "Berlin",
        state: "Berlin",
        country: "Germany",
        postalCode: "10117",
      },
      profile: {
        description: "The largest taxi network in Germany's capital",
        mission: "Connecting Berlin 24/7 with reliable transportation",
        vision: "To be Berlin's mobility leader",
        values: "Reliability, Innovation, Sustainability",
      },
    },
    {
      name: "München Fahrdienst",
      cityName: "Munich",
      timezone: "Europe/Berlin",
      contact: {
        phone: "+49 89 19410",
        email: "service@muenchenfahrdienst.de",
        website: "https://www.muenchenfahrdienst.de",
      },
      address: {
        street: "Marienplatz, 8",
        city: "Munich",
        state: "Bavaria",
        country: "Germany",
        postalCode: "80331",
      },
      profile: {
        description: "Premium transportation service in the heart of Bavaria",
        mission: "Providing exceptional service in Munich and beyond",
        vision: "To set the standard for luxury transportation",
        values: "Quality, Tradition, Service Excellence",
      },
    },
    {
      name: "Hamburg City Rides",
      cityName: "Hamburg",
      timezone: "Europe/Berlin",
      contact: {
        phone: "+49 40 666666",
        email: "contact@hamburgcityrides.de",
        website: "https://www.hamburgcityrides.de",
      },
      address: {
        street: "Reeperbahn, 25",
        city: "Hamburg",
        state: "Hamburg",
        country: "Germany",
        postalCode: "20359",
      },
      profile: {
        description: "Hamburg's modern ride-sharing and taxi service",
        mission: "Navigating Hamburg's waterways and streets with ease",
        vision: "To modernize urban transportation in Hamburg",
        values: "Innovation, Efficiency, Environmental Responsibility",
      },
    },
  ];

  // Create companies with all related data
  const createdCompanies = [];

  for (const companyData of [...italianCompanies, ...germanCompanies]) {
    const company = await prisma.company.create({
      data: {
        name: companyData.name,
        isApproved: true,
        timezone: companyData.timezone,
        contact: {
          create: companyData.contact,
        },
        addresses: {
          create: [companyData.address],
        },
        profile: {
          create: companyData.profile,
        },
        media: {
          create: [
            {
              type: "LOGO",
              url: `https://example.com/logos/${companyData.name
                .toLowerCase()
                .replace(/\s+/g, "-")}-logo.png`,
            },
            {
              type: "BANNER",
              url: `https://example.com/banners/${companyData.name
                .toLowerCase()
                .replace(/\s+/g, "-")}-banner.jpg`,
            },
          ],
        },
      },
    });

    createdCompanies.push({
      ...company,
      cityName: companyData.cityName,
    });
  }

  // Create Users for each company
  const userData = [
    // Italian Users
    {
      name: "Marco Rossi",
      email: "marco.rossi@romataxiservice.it",
      role: "ADMIN",
      company: "Roma Taxi Service",
    },
    {
      name: "Giulia Bianchi",
      email: "giulia.bianchi@romataxiservice.it",
      role: "MANAGER",
      company: "Roma Taxi Service",
    },
    {
      name: "Alessandro Ferrari",
      email: "alessandro.ferrari@milanoexpress.it",
      role: "ADMIN",
      company: "Milano Express",
    },
    {
      name: "Francesca Romano",
      email: "francesca.romano@milanoexpress.it",
      role: "OPERATOR",
      company: "Milano Express",
    },
    {
      name: "Antonio Esposito",
      email: "antonio.esposito@napoliride.it",
      role: "ADMIN",
      company: "Napoli Ride",
    },
    {
      name: "Maria Greco",
      email: "maria.greco@napoliride.it",
      role: "MANAGER",
      company: "Napoli Ride",
    },

    // German Users
    {
      name: "Hans Müller",
      email: "hans.mueller@berlintaxiunion.de",
      role: "ADMIN",
      company: "Berlin Taxi Union",
    },
    {
      name: "Anna Schmidt",
      email: "anna.schmidt@berlintaxiunion.de",
      role: "MANAGER",
      company: "Berlin Taxi Union",
    },
    {
      name: "Thomas Weber",
      email: "thomas.weber@muenchenfahrdienst.de",
      role: "ADMIN",
      company: "München Fahrdienst",
    },
    {
      name: "Petra Wagner",
      email: "petra.wagner@muenchenfahrdienst.de",
      role: "OPERATOR",
      company: "München Fahrdienst",
    },
    {
      name: "Klaus Fischer",
      email: "klaus.fischer@hamburgcityrides.de",
      role: "ADMIN",
      company: "Hamburg City Rides",
    },
    {
      name: "Sabine Becker",
      email: "sabine.becker@hamburgcityrides.de",
      role: "MANAGER",
      company: "Hamburg City Rides",
    },
  ];

  for (const user of userData) {
    const company = createdCompanies.find((c) => c.name === user.company);
    const role = await prisma.role.findUnique({ where: { name: user.role } });

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: await hashPassword("Password123!"),
        companyId: company.id,
        roleId: role.id,
      },
    });
  }

  // Create Drivers
  const driverData = [
    // Italian Drivers
    {
      name: "Giovanni Ricci",
      email: "giovanni.ricci@driver.it",
      phone: "+39 333 1234567",
      vehicle: "Fiat 500X - Taxi",
      company: "Roma Taxi Service",
      status: "online",
    },
    {
      name: "Paolo Conti",
      email: "paolo.conti@driver.it",
      phone: "+39 333 2345678",
      vehicle: "Mercedes E-Class - Black",
      company: "Roma Taxi Service",
      status: "offline",
    },
    {
      name: "Luca Galli",
      email: "luca.galli@driver.it",
      phone: "+39 333 3456789",
      vehicle: "BMW 3 Series - Silver",
      company: "Milano Express",
      status: "online",
    },
    {
      name: "Matteo Barbieri",
      email: "matteo.barbieri@driver.it",
      phone: "+39 333 4567890",
      vehicle: "Audi A4 - Blue",
      company: "Milano Express",
      status: "on_trip",
    },
    {
      name: "Stefano Marini",
      email: "stefano.marini@driver.it",
      phone: "+39 333 5678901",
      vehicle: "Volkswagen Passat - White",
      company: "Napoli Ride",
      status: "online",
    },
    {
      name: "Roberto Costa",
      email: "roberto.costa@driver.it",
      phone: "+39 333 6789012",
      vehicle: "Ford Focus - Red",
      company: "Napoli Ride",
      status: "offline",
    },

    // German Drivers
    {
      name: "Stefan Hoffmann",
      email: "stefan.hoffmann@driver.de",
      phone: "+49 151 1234567",
      vehicle: "Mercedes C-Class - Black",
      company: "Berlin Taxi Union",
      status: "online",
    },
    {
      name: "Michael Koch",
      email: "michael.koch@driver.de",
      phone: "+49 151 2345678",
      vehicle: "BMW 5 Series - Silver",
      company: "Berlin Taxi Union",
      status: "on_trip",
    },
    {
      name: "Andreas Richter",
      email: "andreas.richter@driver.de",
      phone: "+49 151 3456789",
      vehicle: "Audi A6 - Gray",
      company: "München Fahrdienst",
      status: "online",
    },
    {
      name: "Frank Schröder",
      email: "frank.schroeder@driver.de",
      phone: "+49 151 4567890",
      vehicle: "Volkswagen Arteon - Blue",
      company: "München Fahrdienst",
      status: "offline",
    },
    {
      name: "Jürgen Klein",
      email: "juergen.klein@driver.de",
      phone: "+49 151 5678901",
      vehicle: "Mercedes E-Class - White",
      company: "Hamburg City Rides",
      status: "online",
    },
    {
      name: "Ralf Zimmermann",
      email: "ralf.zimmermann@driver.de",
      phone: "+49 151 6789012",
      vehicle: "BMW X3 - Black",
      company: "Hamburg City Rides",
      status: "offline",
    },
  ];

  const createdDrivers = [];
  for (const driver of driverData) {
    const company = createdCompanies.find((c) => c.name === driver.company);
    const city = createdCities.find((c) => c.name === company.cityName);

    const createdDriver = await prisma.driver.create({
      data: {
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        status: driver.status,
        vehicleInfo: driver.vehicle,
        companyId: company.id,
        cityId: city.id,
        timezone: company.timezone,
      },
    });

    createdDrivers.push(createdDriver);
  }

  // Create Driver Locations (for online drivers)
  const onlineDrivers = createdDrivers.filter(
    (_, index) =>
      driverData[index].status === "online" ||
      driverData[index].status === "on_trip"
  );

  const locationCoordinates = {
    Rome: [41.9028, 12.4964],
    Milan: [45.4642, 9.19],
    Naples: [40.8518, 14.2681],
    Berlin: [52.52, 13.405],
    Munich: [48.1351, 11.582],
    Hamburg: [53.5511, 9.9937],
  };

  for (const driver of onlineDrivers) {
    const company = createdCompanies.find((c) => c.id === driver.companyId);
    const coords = locationCoordinates[company.cityName];

    await prisma.location.create({
      data: {
        driverId: driver.id,
        lat: coords[0] + (Math.random() - 0.5) * 0.1, // Add some random offset
        lng: coords[1] + (Math.random() - 0.5) * 0.1,
      },
    });
  }

  // Create Driver Availability
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  for (const driver of createdDrivers) {
    // Create availability for today and tomorrow
    for (let day = 0; day < 2; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);

      await prisma.driverAvailability.create({
        data: {
          driverId: driver.id,
          startTime: new Date(date.setHours(8, 0, 0, 0)),
          endTime: new Date(date.setHours(20, 0, 0, 0)),
        },
      });
    }
  }

  // Create Customers
  const customerData = [
    // Italian Customers
    {
      name: "Elena Martinelli",
      email: "elena.martinelli@email.it",
      phone: "+39 320 1234567",
      company: "Roma Taxi Service",
    },
    {
      name: "Davide Santoro",
      email: "davide.santoro@email.it",
      phone: "+39 320 2345678",
      company: "Roma Taxi Service",
    },
    {
      name: "Chiara Lombardi",
      email: "chiara.lombardi@email.it",
      phone: "+39 320 3456789",
      company: "Milano Express",
    },
    {
      name: "Lorenzo Mancini",
      email: "lorenzo.mancini@email.it",
      phone: "+39 320 4567890",
      company: "Milano Express",
    },
    {
      name: "Valentina De Luca",
      email: "valentina.deluca@email.it",
      phone: "+39 320 5678901",
      company: "Napoli Ride",
    },
    {
      name: "Simone Moretti",
      email: "simone.moretti@email.it",
      phone: "+39 320 6789012",
      company: "Napoli Ride",
    },

    // German Customers
    {
      name: "Julia Lehmann",
      email: "julia.lehmann@email.de",
      phone: "+49 170 1234567",
      company: "Berlin Taxi Union",
    },
    {
      name: "Daniel Krause",
      email: "daniel.krause@email.de",
      phone: "+49 170 2345678",
      company: "Berlin Taxi Union",
    },
    {
      name: "Lisa Huber",
      email: "lisa.huber@email.de",
      phone: "+49 170 3456789",
      company: "München Fahrdienst",
    },
    {
      name: "Markus Fuchs",
      email: "markus.fuchs@email.de",
      phone: "+49 170 4567890",
      company: "München Fahrdienst",
    },
    {
      name: "Sarah Braun",
      email: "sarah.braun@email.de",
      phone: "+49 170 5678901",
      company: "Hamburg City Rides",
    },
    {
      name: "Christian Wolf",
      email: "christian.wolf@email.de",
      phone: "+49 170 6789012",
      company: "Hamburg City Rides",
    },
  ];

  const createdCustomers = [];
  for (const customer of customerData) {
    const company = createdCompanies.find((c) => c.name === customer.company);

    const createdCustomer = await prisma.customer.create({
      data: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        companyId: company.id,
      },
    });

    createdCustomers.push(createdCustomer);
  }

  // Create Bookings
  const bookingData = [
    // Italian Bookings
    {
      pickup: "Colosseum, Rome",
      dropoff: "Vatican City, Rome",
      status: "completed",
      fare: 25.5,
      customer: "Elena Martinelli",
      driver: "Giovanni Ricci",
    },
    {
      pickup: "Termini Station, Rome",
      dropoff: "Trastevere, Rome",
      status: "ongoing",
      fare: null,
      customer: "Davide Santoro",
      driver: "Paolo Conti",
    },
    {
      pickup: "Duomo, Milan",
      dropoff: "Navigli District, Milan",
      status: "accepted",
      fare: 18.0,
      customer: "Chiara Lombardi",
      driver: "Luca Galli",
    },
    {
      pickup: "Brera, Milan",
      dropoff: "Porta Nuova, Milan",
      status: "pending",
      fare: null,
      customer: "Lorenzo Mancini",
      driver: null,
    },
    {
      pickup: "Naples Central Station",
      dropoff: "Pompeii",
      status: "completed",
      fare: 45.0,
      customer: "Valentina De Luca",
      driver: "Stefano Marini",
    },
    {
      pickup: "Spaccanapoli, Naples",
      dropoff: "Vomero, Naples",
      status: "cancelled",
      fare: null,
      customer: "Simone Moretti",
      driver: "Roberto Costa",
    },

    // German Bookings
    {
      pickup: "Brandenburg Gate, Berlin",
      dropoff: "Alexanderplatz, Berlin",
      status: "completed",
      fare: 15.5,
      customer: "Julia Lehmann",
      driver: "Stefan Hoffmann",
    },
    {
      pickup: "Berlin Hauptbahnhof",
      dropoff: "Potsdamer Platz, Berlin",
      status: "ongoing",
      fare: null,
      customer: "Daniel Krause",
      driver: "Michael Koch",
    },
    {
      pickup: "Marienplatz, Munich",
      dropoff: "BMW Welt, Munich",
      status: "accepted",
      fare: 22.0,
      customer: "Lisa Huber",
      driver: "Andreas Richter",
    },
    {
      pickup: "Munich Airport",
      dropoff: "City Center, Munich",
      status: "pending",
      fare: null,
      customer: "Markus Fuchs",
      driver: null,
    },
    {
      pickup: "HafenCity, Hamburg",
      dropoff: "St. Pauli, Hamburg",
      status: "completed",
      fare: 12.75,
      customer: "Sarah Braun",
      driver: "Jürgen Klein",
    },
    {
      pickup: "Hamburg Airport",
      dropoff: "Altona, Hamburg",
      status: "cancelled",
      fare: null,
      customer: "Christian Wolf",
      driver: "Ralf Zimmermann",
    },
  ];

  for (const booking of bookingData) {
    const customer = createdCustomers.find((c) => c.name === booking.customer);
    const driver = booking.driver
      ? createdDrivers.find((d) => d.name === booking.driver)
      : null;
    const company = createdCompanies.find((c) => c.id === customer.companyId);

    await prisma.booking.create({
      data: {
        customerId: customer.id,
        driverId: driver?.id || null,
        companyId: company.id,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        status: booking.status,
        fare: booking.fare,
        requestedAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ), // Random time in last 7 days
      },
    });
  }

  console.log("🌱 Seed data created successfully!");
  console.log("📊 Summary:");
  console.log(`• 1 SuperAdmin`);
  console.log(`• ${createdCities.length} Cities (Italian & German)`);
  console.log(`• ${createdCompanies.length} Companies (3 Italian, 3 German)`);
  console.log(`• ${userData.length} Users`);
  console.log(`• ${driverData.length} Drivers`);
  console.log(`• ${customerData.length} Customers`);
  console.log(`• ${bookingData.length} Bookings`);
  console.log(`• 3 Roles with Permissions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
