// prisma/europeSeed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function seedEuropeanData() {
  console.log("Starting European database seeding...");

  // We won't clean existing data, just add new entries

  // Create European Cities
  console.log("Creating European cities...");
  const europeanCities = await Promise.all([
    prisma.city.create({ data: { name: "Paris" } }),
    prisma.city.create({ data: { name: "Berlin" } }),
    prisma.city.create({ data: { name: "Madrid" } }),
    prisma.city.create({ data: { name: "Rome" } }),
    prisma.city.create({ data: { name: "Amsterdam" } }),
    prisma.city.create({ data: { name: "Vienna" } }),
    prisma.city.create({ data: { name: "Brussels" } }),
    prisma.city.create({ data: { name: "Stockholm" } }),
    prisma.city.create({ data: { name: "Prague" } }),
    prisma.city.create({ data: { name: "Barcelona" } }),
  ]);

  // Get existing roles (we'll reuse them)
  console.log("Fetching existing roles...");
  const roles = {
    admin: await prisma.role.findFirst({ where: { name: "admin" } }),
    dispatcher: await prisma.role.findFirst({ where: { name: "dispatcher" } }),
    analyst: await prisma.role.findFirst({ where: { name: "analyst" } }),
  };

  // Create European Companies
  console.log("Creating European companies...");
  const europeanCompanies = await Promise.all([
    prisma.company.create({
      data: {
        name: "EuroRides",
        email: "info@eurorides.eu",
        isApproved: true,
        timezone: "Europe/Paris",
      },
    }),
    prisma.company.create({
      data: {
        name: "GermanWheels",
        email: "kontakt@germanwheels.de",
        isApproved: true,
        timezone: "Europe/Berlin",
      },
    }),
    prisma.company.create({
      data: {
        name: "ItalianTransfers",
        email: "info@italiantransfers.it",
        isApproved: true,
        timezone: "Europe/Rome",
      },
    }),
    prisma.company.create({
      data: {
        name: "SpanishCab",
        email: "hola@spanishcab.es",
        isApproved: false,
        timezone: "Europe/Madrid",
      },
    }),
  ]);

  // Create Users for European companies
  console.log("Creating European users...");
  const europeanUsers = [];
  for (const company of europeanCompanies) {
    // Admin for each company
    europeanUsers.push(
      await prisma.user.create({
        data: {
          name: `Admin ${company.name}`,
          email: `admin@${company.name.toLowerCase().replace(/\s+/g, "")}.com`,
          password: await bcrypt.hash("Password123", 10),
          companyId: company.id,
          roleId: roles.admin.id,
        },
      })
    );

    // Dispatcher for each company
    europeanUsers.push(
      await prisma.user.create({
        data: {
          name: `Dispatcher ${company.name}`,
          email: `dispatcher@${company.name
            .toLowerCase()
            .replace(/\s+/g, "")}.com`,
          password: await bcrypt.hash("Password123", 10),
          companyId: company.id,
          roleId: roles.dispatcher.id,
        },
      })
    );

    // Analyst for each company
    europeanUsers.push(
      await prisma.user.create({
        data: {
          name: `Analyst ${company.name}`,
          email: `analyst@${company.name
            .toLowerCase()
            .replace(/\s+/g, "")}.com`,
          password: await bcrypt.hash("Password123", 10),
          companyId: company.id,
          roleId: roles.analyst.id,
        },
      })
    );
  }

  // European Drivers Data - Realistic names and vehicles
  console.log("Creating European drivers...");
  const europeanDrivers = [];

  // Sample driver data by country
  const driverData = {
    EuroRides: [
      {
        name: "Antoine Lefevre",
        email: "antoine@drivers.eurorides.eu",
        phone: "+33612345678",
        vehicle: "Renault Megane, White, License: 5432ABC",
        cityName: "Paris",
      },
      {
        name: "Mathilde Rousseau",
        email: "mathilde@drivers.eurorides.eu",
        phone: "+33623456789",
        vehicle: "Peugeot 308, Black, License: 7654CBA",
        cityName: "Paris",
      },
      {
        name: "Jean Dupont",
        email: "jean@drivers.eurorides.eu",
        phone: "+33634567890",
        vehicle: "Citroën C4, Silver, License: 8765DEF",
        cityName: "Paris",
      },
    ],
    GermanWheels: [
      {
        name: "Klaus Weber",
        email: "klaus@drivers.germanwheels.de",
        phone: "+491234567890",
        vehicle: "Volkswagen Passat, Silver, License: B-KW-1234",
        cityName: "Berlin",
      },
      {
        name: "Ursula Schneider",
        email: "ursula@drivers.germanwheels.de",
        phone: "+491567890123",
        vehicle: "Mercedes C-Class, Black, License: B-US-5678",
        cityName: "Berlin",
      },
      {
        name: "Hans Mueller",
        email: "hans@drivers.germanwheels.de",
        phone: "+491789012345",
        vehicle: "BMW 3 Series, Blue, License: B-HM-9012",
        cityName: "Berlin",
      },
    ],
    ItalianTransfers: [
      {
        name: "Roberto Bianchi",
        email: "roberto@drivers.italiantransfers.it",
        phone: "+393456789012",
        vehicle: "Fiat 500, Red, License: RM456789",
        cityName: "Rome",
      },
      {
        name: "Francesca Conti",
        email: "francesca@drivers.italiantransfers.it",
        phone: "+393212345678",
        vehicle: "Alfa Romeo Giulia, Blue, License: RM789012",
        cityName: "Rome",
      },
      {
        name: "Marco Rossi",
        email: "marco@drivers.italiantransfers.it",
        phone: "+393678901234",
        vehicle: "Lancia Ypsilon, White, License: RM345678",
        cityName: "Rome",
      },
    ],
    SpanishCab: [
      {
        name: "Carlos Hernández",
        email: "carlos@drivers.spanishcab.es",
        phone: "+34612345678",
        vehicle: "Seat Leon, Gray, License: 1234-BCN",
        cityName: "Madrid",
      },
      {
        name: "Isabella Gomez",
        email: "isabella@drivers.spanishcab.es",
        phone: "+34698765432",
        vehicle: "Seat Ibiza, White, License: 5678-MAD",
        cityName: "Madrid",
      },
      {
        name: "Miguel Rodriguez",
        email: "miguel@drivers.spanishcab.es",
        phone: "+34654321098",
        vehicle: "Renault Clio, Red, License: 9012-MAD",
        cityName: "Barcelona",
      },
    ],
  };

  const driverStatuses = ["offline", "online", "on_trip"];

  for (const company of europeanCompanies) {
    if (!company.isApproved && company.name === "SpanishCab") continue; // Skip unapproved companies

    const companyDrivers = driverData[company.name] || [];

    for (const driverInfo of companyDrivers) {
      const cityRef = await prisma.city.findFirst({
        where: { name: driverInfo.cityName },
      });

      if (!cityRef) continue;

      const driver = await prisma.driver.create({
        data: {
          name: driverInfo.name,
          email: driverInfo.email,
          phone: driverInfo.phone,
          status:
            driverStatuses[Math.floor(Math.random() * driverStatuses.length)],
          vehicleInfo: driverInfo.vehicle,
          companyId: company.id,
          cityId: cityRef.id,
          timezone: company.timezone,
        },
      });
      europeanDrivers.push(driver);

      // Create location for each driver - using realistic European coordinates
      let lat, lng;
      switch (driverInfo.cityName) {
        case "Paris":
          lat = 48.8566 + (Math.random() - 0.5) * 0.05;
          lng = 2.3522 + (Math.random() - 0.5) * 0.05;
          break;
        case "Berlin":
          lat = 52.52 + (Math.random() - 0.5) * 0.05;
          lng = 13.405 + (Math.random() - 0.5) * 0.05;
          break;
        case "Madrid":
          lat = 40.4168 + (Math.random() - 0.5) * 0.05;
          lng = -3.7038 + (Math.random() - 0.5) * 0.05;
          break;
        case "Rome":
          lat = 41.9028 + (Math.random() - 0.5) * 0.05;
          lng = 12.4964 + (Math.random() - 0.5) * 0.05;
          break;
        case "Barcelona":
          lat = 41.3851 + (Math.random() - 0.5) * 0.05;
          lng = 2.1734 + (Math.random() - 0.5) * 0.05;
          break;
        default:
          lat = 50.0 + (Math.random() - 0.5) * 10;
          lng = 10.0 + (Math.random() - 0.5) * 10;
      }

      await prisma.location.create({
        data: {
          driverId: driver.id,
          lat,
          lng,
        },
      });

      // Create availability for each driver using European working hours
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

      // Evening shift for some drivers
      if (Math.random() > 0.5) {
        await prisma.driverAvailability.create({
          data: {
            driverId: driver.id,
            startTime: new Date(tomorrow.setHours(16, 0, 0, 0)),
            endTime: new Date(tomorrow.setHours(23, 59, 0, 0)),
          },
        });
      }
    }
  }

  // Create European Customers
  console.log("Creating European customers...");
  const europeanCustomers = [];

  // Sample customer data by company
  const customerData = {
    EuroRides: [
      {
        name: "Vincent Dupont",
        email: "vincent@gmail.com",
        phone: "+33712345678",
      },
      {
        name: "Amélie Moreau",
        email: "amelie@yahoo.fr",
        phone: "+33723456789",
      },
      {
        name: "Sophie Martin",
        email: "sophie@outlook.fr",
        phone: "+33734567890",
      },
    ],
    GermanWheels: [
      {
        name: "Thomas Fischer",
        email: "thomas@gmail.com",
        phone: "+491534567890",
      },
      { name: "Anna Wagner", email: "anna@outlook.de", phone: "+491645678901" },
      {
        name: "Lukas Schmidt",
        email: "lukas@gmail.com",
        phone: "+491756789012",
      },
    ],
    ItalianTransfers: [
      {
        name: "Luca Esposito",
        email: "luca@gmail.com",
        phone: "+393456789012",
      },
      { name: "Sofia Marino", email: "sofia@yahoo.it", phone: "+393567890123" },
      {
        name: "Elena Romano",
        email: "elena@outlook.it",
        phone: "+393678901234",
      },
    ],
    SpanishCab: [
      {
        name: "Miguel Fernández",
        email: "miguel@gmail.com",
        phone: "+34612345678",
      },
      {
        name: "Lucía Martínez",
        email: "lucia@hotmail.es",
        phone: "+34723456789",
      },
      {
        name: "Pablo Sánchez",
        email: "pablo@outlook.es",
        phone: "+34834567890",
      },
    ],
  };

  for (const company of europeanCompanies) {
    const companyCustomers = customerData[company.name] || [];

    for (const customerInfo of companyCustomers) {
      const customer = await prisma.customer.create({
        data: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          companyId: company.id,
        },
      });
      europeanCustomers.push(customer);
    }
  }

  // Create European Bookings
  console.log("Creating European bookings...");
  const bookingStatuses = [
    "pending",
    "accepted",
    "ongoing",
    "completed",
    "cancelled",
  ];

  // European locations by city
  const europeanLocations = {
    Paris: [
      "Charles de Gaulle Airport, Terminal 2E",
      "Eiffel Tower, Champ de Mars",
      "Gare du Nord",
      "Louvre Museum",
      "Notre-Dame Cathedral",
    ],
    Berlin: [
      "Berlin Brandenburg Airport",
      "Brandenburg Gate",
      "Alexanderplatz",
      "Berlin Hauptbahnhof",
      "Checkpoint Charlie",
    ],
    Madrid: [
      "Madrid Barajas Airport",
      "Puerta del Sol",
      "Plaza Mayor",
      "Royal Palace of Madrid",
      "Prado Museum",
    ],
    Rome: [
      "Rome Fiumicino Airport",
      "Colosseum",
      "Vatican City",
      "Trevi Fountain",
      "Spanish Steps",
    ],
    Barcelona: [
      "Barcelona El Prat Airport",
      "Sagrada Familia",
      "Park Güell",
      "La Rambla",
      "Gothic Quarter",
    ],
  };

  for (const company of europeanCompanies) {
    if (!company.isApproved && company.name === "SpanishCab") continue; // Skip unapproved companies

    const companyDrivers = europeanDrivers.filter(
      (d) => d.companyId === company.id
    );
    const companyCustomers = europeanCustomers.filter(
      (c) => c.companyId === company.id
    );

    if (companyDrivers.length === 0 || companyCustomers.length === 0) continue;

    // Determine city for this company
    let cityName;
    switch (company.name) {
      case "EuroRides":
        cityName = "Paris";
        break;
      case "GermanWheels":
        cityName = "Berlin";
        break;
      case "ItalianTransfers":
        cityName = "Rome";
        break;
      case "SpanishCab":
        cityName = "Madrid";
        break;
      default:
        cityName = "Paris";
    }

    const locations = europeanLocations[cityName] || europeanLocations["Paris"];

    // Create multiple bookings for each company
    for (let i = 0; i < 10; i++) {
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
            status === "completed" ? Math.floor(15 + Math.random() * 45) : null,
          requestedAt: new Date(
            Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
          ), // Random date in the last week
        },
      });
    }
  }

  console.log("European database seeding completed successfully!");
}

// Main function to execute seed
async function main() {
  try {
    await seedEuropeanData();
  } catch (error) {
    console.error("Error seeding European data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed
main();
