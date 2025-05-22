const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Adding additional data to existing companies...");

  // Hash password function
  const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
  };

  // Get existing companies and cities
  const companies = await prisma.company.findMany({
    include: {
      contact: true,
      addresses: true,
    },
  });

  const cities = await prisma.city.findMany();
  const roles = await prisma.role.findMany();

  console.log(`Found ${companies.length} companies:`);
  companies.forEach((c) => console.log(`- ${c.name}`));

  console.log(`Found ${cities.length} cities:`);
  cities.forEach((c) => console.log(`- ${c.name}`));

  console.log(`Found ${roles.length} roles:`);
  roles.forEach((r) => console.log(`- ${r.name}`));

  // Helper function to get company by name
  const getCompany = (name) => {
    const company = companies.find((c) => c.name === name);
    if (!company) {
      console.error(`❌ Company not found: ${name}`);
      return null;
    }
    return company;
  };

  const getCity = (name) => {
    const city = cities.find((c) => c.name === name);
    if (!city) {
      console.error(`❌ City not found: ${name}`);
      return null;
    }
    return city;
  };

  const getRole = (name) => {
    const role = roles.find((r) => r.name === name);
    if (!role) {
      console.error(`❌ Role not found: ${name}`);
      return null;
    }
    return role;
  };

  // Additional Italian Drivers
  const additionalItalianDrivers = [
    // Roma Taxi Service - Additional drivers
    {
      name: "Francesco Rizzo",
      email: "francesco.rizzo@driver.it",
      phone: "+39 333 7890123",
      vehicle: "Toyota Prius Hybrid - Green",
      company: "Roma Taxi Service",
      status: "online",
    },
    {
      name: "Andrea Vitale",
      email: "andrea.vitale@driver.it",
      phone: "+39 333 8901234",
      vehicle: "Nissan Leaf - Electric Blue",
      company: "Roma Taxi Service",
      status: "offline",
    },
    {
      name: "Salvatore Russo",
      email: "salvatore.russo@driver.it",
      phone: "+39 333 9012345",
      vehicle: "Renault Captur - Orange",
      company: "Roma Taxi Service",
      status: "on_trip",
    },
    {
      name: "Vincenzo Serra",
      email: "vincenzo.serra@driver.it",
      phone: "+39 333 0123456",
      vehicle: "Peugeot 308 - Gray",
      company: "Roma Taxi Service",
      status: "online",
    },

    // Milano Express - Additional drivers
    {
      name: "Fabio Pellegrini",
      email: "fabio.pellegrini@driver.it",
      phone: "+39 334 1234567",
      vehicle: "Tesla Model 3 - White",
      company: "Milano Express",
      status: "online",
    },
    {
      name: "Daniele Fabbri",
      email: "daniele.fabbri@driver.it",
      phone: "+39 334 2345678",
      vehicle: "Volvo XC40 - Blue",
      company: "Milano Express",
      status: "offline",
    },
    {
      name: "Claudio Marchetti",
      email: "claudio.marchetti@driver.it",
      phone: "+39 334 3456789",
      vehicle: "Alfa Romeo Giulia - Red",
      company: "Milano Express",
      status: "on_trip",
    },
    {
      name: "Emanuele Orlando",
      email: "emanuele.orlando@driver.it",
      phone: "+39 334 4567890",
      vehicle: "Maserati Ghibli - Black",
      company: "Milano Express",
      status: "online",
    },

    // Napoli Ride - Additional drivers
    {
      name: "Gennaro Caputo",
      email: "gennaro.caputo@driver.it",
      phone: "+39 335 1234567",
      vehicle: "Fiat Panda - Yellow",
      company: "Napoli Ride",
      status: "online",
    },
    {
      name: "Pasquale Bruno",
      email: "pasquale.bruno@driver.it",
      phone: "+39 335 2345678",
      vehicle: "Lancia Ypsilon - Silver",
      company: "Napoli Ride",
      status: "offline",
    },
    {
      name: "Ciro Ferrara",
      email: "ciro.ferrara@driver.it",
      phone: "+39 335 3456789",
      vehicle: "Jeep Renegade - Green",
      company: "Napoli Ride",
      status: "on_trip",
    },
    {
      name: "Luigi Galdi",
      email: "luigi.galdi@driver.it",
      phone: "+39 335 4567890",
      vehicle: "Hyundai Tucson - White",
      company: "Napoli Ride",
      status: "online",
    },
  ];

  // Additional German Drivers
  const additionalGermanDrivers = [
    // Berlin Taxi Union - Additional drivers
    {
      name: "Tobias Neumann",
      email: "tobias.neumann@driver.de",
      phone: "+49 152 1234567",
      vehicle: "Tesla Model S - Black",
      company: "Berlin Taxi Union",
      status: "online",
    },
    {
      name: "Florian Lange",
      email: "florian.lange@driver.de",
      phone: "+49 152 2345678",
      vehicle: "Porsche Cayenne - Silver",
      company: "Berlin Taxi Union",
      status: "offline",
    },
    {
      name: "Sebastian Horn",
      email: "sebastian.horn@driver.de",
      phone: "+49 152 3456789",
      vehicle: "Mini Cooper S - Red",
      company: "Berlin Taxi Union",
      status: "on_trip",
    },
    {
      name: "Oliver Scholz",
      email: "oliver.scholz@driver.de",
      phone: "+49 152 4567890",
      vehicle: "Opel Insignia - Blue",
      company: "Berlin Taxi Union",
      status: "online",
    },

    // München Fahrdienst - Additional drivers
    {
      name: "Maximilian König",
      email: "maximilian.koenig@driver.de",
      phone: "+49 153 1234567",
      vehicle: "BMW i8 - White",
      company: "München Fahrdienst",
      status: "online",
    },
    {
      name: "Alexander Weiß",
      email: "alexander.weiss@driver.de",
      phone: "+49 153 2345678",
      vehicle: "Audi Q7 - Black",
      company: "München Fahrdienst",
      status: "offline",
    },
    {
      name: "Benjamin Pohl",
      email: "benjamin.pohl@driver.de",
      phone: "+49 153 3456789",
      vehicle: "Mercedes S-Class - Silver",
      company: "München Fahrdienst",
      status: "on_trip",
    },
    {
      name: "Philipp Engel",
      email: "philipp.engel@driver.de",
      phone: "+49 153 4567890",
      vehicle: "Volkswagen Touareg - Gray",
      company: "München Fahrdienst",
      status: "online",
    },

    // Hamburg City Rides - Additional drivers
    {
      name: "Jan Sommer",
      email: "jan.sommer@driver.de",
      phone: "+49 154 1234567",
      vehicle: "Volvo V90 - Blue",
      company: "Hamburg City Rides",
      status: "online",
    },
    {
      name: "Nils Winter",
      email: "nils.winter@driver.de",
      phone: "+49 154 2345678",
      vehicle: "Saab 9-3 - Green",
      company: "Hamburg City Rides",
      status: "offline",
    },
    {
      name: "Lars Förster",
      email: "lars.foerster@driver.de",
      phone: "+49 154 3456789",
      vehicle: "Skoda Superb - White",
      company: "Hamburg City Rides",
      status: "on_trip",
    },
    {
      name: "Tim Baumann",
      email: "tim.baumann@driver.de",
      phone: "+49 154 4567890",
      vehicle: "Seat Leon - Orange",
      company: "Hamburg City Rides",
      status: "online",
    },
  ];

  // Create additional drivers
  const allAdditionalDrivers = [
    ...additionalItalianDrivers,
    ...additionalGermanDrivers,
  ];
  const createdAdditionalDrivers = [];

  for (const driver of allAdditionalDrivers) {
    const company = getCompany(driver.company);
    if (!company) {
      console.error(
        `❌ Skipping driver ${driver.name} - company not found: ${driver.company}`
      );
      continue;
    }

    const cityName = {
      "Roma Taxi Service": "Rome",
      "Milano Express": "Milan",
      "Napoli Ride": "Naples",
      "Berlin Taxi Union": "Berlin",
      "München Fahrdienst": "Munich",
      "Hamburg City Rides": "Hamburg",
    }[driver.company];

    const city = getCity(cityName);
    if (!city) {
      console.error(
        `❌ Skipping driver ${driver.name} - city not found: ${cityName}`
      );
      continue;
    }

    try {
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

      createdAdditionalDrivers.push({
        ...createdDriver,
        cityName,
        status: driver.status,
      });
      console.log(`✅ Created driver: ${driver.name} for ${driver.company}`);
    } catch (error) {
      console.error(`❌ Error creating driver ${driver.name}:`, error.message);
    }
  }

  // Create locations for online/on_trip drivers
  const locationCoordinates = {
    Rome: [41.9028, 12.4964],
    Milan: [45.4642, 9.19],
    Naples: [40.8518, 14.2681],
    Berlin: [52.52, 13.405],
    Munich: [48.1351, 11.582],
    Hamburg: [53.5511, 9.9937],
  };

  const onlineAdditionalDrivers = createdAdditionalDrivers.filter(
    (d) => d.status === "online" || d.status === "on_trip"
  );

  for (const driver of onlineAdditionalDrivers) {
    const coords = locationCoordinates[driver.cityName];

    await prisma.location.create({
      data: {
        driverId: driver.id,
        lat: coords[0] + (Math.random() - 0.5) * 0.15,
        lng: coords[1] + (Math.random() - 0.5) * 0.15,
      },
    });
  }

  // Create availability for additional drivers
  const today = new Date();

  for (const driver of createdAdditionalDrivers) {
    // Create availability for next 5 days
    for (let day = 0; day < 5; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);

      // Some drivers work different shifts
      const shiftType = Math.random();
      let startHour, endHour;

      if (shiftType < 0.3) {
        // Early shift
        startHour = 6;
        endHour = 14;
      } else if (shiftType < 0.6) {
        // Regular shift
        startHour = 8;
        endHour = 18;
      } else if (shiftType < 0.9) {
        // Late shift
        startHour = 14;
        endHour = 22;
      } else {
        // Night shift
        startHour = 22;
        endHour = 6; // Next day
      }

      const startTime = new Date(date.setHours(startHour, 0, 0, 0));
      const endTime = new Date(date.setHours(endHour, 0, 0, 0));

      if (endHour < startHour) {
        endTime.setDate(endTime.getDate() + 1);
      }

      await prisma.driverAvailability.create({
        data: {
          driverId: driver.id,
          startTime,
          endTime,
        },
      });
    }
  }

  // Additional Users for companies
  const additionalUsers = [
    // Italian Users
    {
      name: "Chiara Fontana",
      email: "chiara.fontana@romataxiservice.it",
      role: "OPERATOR",
      company: "Roma Taxi Service",
    },
    {
      name: "Riccardo Longo",
      email: "riccardo.longo@romataxiservice.it",
      role: "OPERATOR",
      company: "Roma Taxi Service",
    },
    {
      name: "Silvia Monti",
      email: "silvia.monti@milanoexpress.it",
      role: "MANAGER",
      company: "Milano Express",
    },
    {
      name: "Federico Villa",
      email: "federico.villa@milanoexpress.it",
      role: "OPERATOR",
      company: "Milano Express",
    },
    {
      name: "Giorgia Cattaneo",
      email: "giorgia.cattaneo@napoliride.it",
      role: "OPERATOR",
      company: "Napoli Ride",
    },
    {
      name: "Nicola De Santis",
      email: "nicola.desantis@napoliride.it",
      role: "OPERATOR",
      company: "Napoli Ride",
    },

    // German Users
    {
      name: "Jennifer Krüger",
      email: "jennifer.krueger@berlintaxiunion.de",
      role: "OPERATOR",
      company: "Berlin Taxi Union",
    },
    {
      name: "Patrick Roth",
      email: "patrick.roth@berlintaxiunion.de",
      role: "OPERATOR",
      company: "Berlin Taxi Union",
    },
    {
      name: "Nicole Hartmann",
      email: "nicole.hartmann@muenchenfahrdienst.de",
      role: "MANAGER",
      company: "München Fahrdienst",
    },
    {
      name: "Robert Jung",
      email: "robert.jung@muenchenfahrdienst.de",
      role: "OPERATOR",
      company: "München Fahrdienst",
    },
    {
      name: "Melanie Vogel",
      email: "melanie.vogel@hamburgcityrides.de",
      role: "OPERATOR",
      company: "Hamburg City Rides",
    },
    {
      name: "Carsten Möller",
      email: "carsten.moeller@hamburgcityrides.de",
      role: "OPERATOR",
      company: "Hamburg City Rides",
    },
  ];

  for (const user of additionalUsers) {
    const company = getCompany(user.company);
    const role = getRole(user.role);

    if (!company) {
      console.error(
        `❌ Skipping user ${user.name} - company not found: ${user.company}`
      );
      continue;
    }

    if (!role) {
      console.error(
        `❌ Skipping user ${user.name} - role not found: ${user.role}`
      );
      continue;
    }

    try {
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: await hashPassword("Password123!"),
          companyId: company.id,
          roleId: role.id,
        },
      });
      console.log(`✅ Created user: ${user.name} for ${user.company}`);
    } catch (error) {
      console.error(`❌ Error creating user ${user.name}:`, error.message);
    }
  }

  // Additional Customers
  const additionalCustomers = [
    // Italian Customers
    {
      name: "Alessandra Neri",
      email: "alessandra.neri@gmail.com",
      phone: "+39 320 7890123",
      company: "Roma Taxi Service",
    },
    {
      name: "Gabriele Parisi",
      email: "gabriele.parisi@yahoo.it",
      phone: "+39 320 8901234",
      company: "Roma Taxi Service",
    },
    {
      name: "Cristina Benedetti",
      email: "cristina.benedetti@outlook.it",
      phone: "+39 321 1234567",
      company: "Roma Taxi Service",
    },
    {
      name: "Michele Giorgi",
      email: "michele.giorgi@libero.it",
      phone: "+39 321 2345678",
      company: "Roma Taxi Service",
    },

    {
      name: "Federica Caruso",
      email: "federica.caruso@gmail.com",
      phone: "+39 321 3456789",
      company: "Milano Express",
    },
    {
      name: "Tommaso Ferretti",
      email: "tommaso.ferretti@hotmail.it",
      phone: "+39 321 4567890",
      company: "Milano Express",
    },
    {
      name: "Beatrice Ricci",
      email: "beatrice.ricci@yahoo.it",
      phone: "+39 321 5678901",
      company: "Milano Express",
    },
    {
      name: "Mattia Fiorentino",
      email: "mattia.fiorentino@gmail.com",
      phone: "+39 321 6789012",
      company: "Milano Express",
    },

    {
      name: "Serena Palmieri",
      email: "serena.palmieri@outlook.it",
      phone: "+39 322 1234567",
      company: "Napoli Ride",
    },
    {
      name: "Raffaele Gallo",
      email: "raffaele.gallo@libero.it",
      phone: "+39 322 2345678",
      company: "Napoli Ride",
    },
    {
      name: "Monica Sorrentino",
      email: "monica.sorrentino@gmail.com",
      phone: "+39 322 3456789",
      company: "Napoli Ride",
    },
    {
      name: "Gaetano Amato",
      email: "gaetano.amato@yahoo.it",
      phone: "+39 322 4567890",
      company: "Napoli Ride",
    },

    // German Customers
    {
      name: "Sandra Günther",
      email: "sandra.guenther@gmail.com",
      phone: "+49 171 1234567",
      company: "Berlin Taxi Union",
    },
    {
      name: "Marco Dietrich",
      email: "marco.dietrich@web.de",
      phone: "+49 171 2345678",
      company: "Berlin Taxi Union",
    },
    {
      name: "Claudia Ludwig",
      email: "claudia.ludwig@gmx.de",
      phone: "+49 171 3456789",
      company: "Berlin Taxi Union",
    },
    {
      name: "Sven Böhm",
      email: "sven.boehm@outlook.de",
      phone: "+49 171 4567890",
      company: "Berlin Taxi Union",
    },

    {
      name: "Kathrin Scholze",
      email: "kathrin.scholze@gmail.com",
      phone: "+49 172 1234567",
      company: "München Fahrdienst",
    },
    {
      name: "René Schuster",
      email: "rene.schuster@t-online.de",
      phone: "+49 172 2345678",
      company: "München Fahrdienst",
    },
    {
      name: "Birgit Henkel",
      email: "birgit.henkel@web.de",
      phone: "+49 172 3456789",
      company: "München Fahrdienst",
    },
    {
      name: "Dirk Albrecht",
      email: "dirk.albrecht@gmx.de",
      phone: "+49 172 4567890",
      company: "München Fahrdienst",
    },

    {
      name: "Anja Kellner",
      email: "anja.kellner@gmail.com",
      phone: "+49 173 1234567",
      company: "Hamburg City Rides",
    },
    {
      name: "Holger Franke",
      email: "holger.franke@outlook.de",
      phone: "+49 173 2345678",
      company: "Hamburg City Rides",
    },
    {
      name: "Ines Haas",
      email: "ines.haas@t-online.de",
      phone: "+49 173 3456789",
      company: "Hamburg City Rides",
    },
    {
      name: "Uwe Fricke",
      email: "uwe.fricke@web.de",
      phone: "+49 173 4567890",
      company: "Hamburg City Rides",
    },
  ];

  const createdAdditionalCustomers = [];
  for (const customer of additionalCustomers) {
    const company = getCompany(customer.company);

    if (!company) {
      console.error(
        `❌ Skipping customer ${customer.name} - company not found: ${customer.company}`
      );
      continue;
    }

    try {
      const createdCustomer = await prisma.customer.create({
        data: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          companyId: company.id,
        },
      });

      createdAdditionalCustomers.push({
        ...createdCustomer,
        companyName: customer.company,
      });
      console.log(
        `✅ Created customer: ${customer.name} for ${customer.company}`
      );
    } catch (error) {
      console.error(
        `❌ Error creating customer ${customer.name}:`,
        error.message
      );
    }
  }

  // Get all drivers (existing + new) for booking assignment
  const allDrivers = await prisma.driver.findMany({
    include: {
      company: true,
    },
  });

  // Additional Bookings
  const additionalBookings = [
    // Rome bookings
    {
      pickup: "Pantheon, Rome",
      dropoff: "Spanish Steps, Rome",
      status: "completed",
      fare: 12.5,
      company: "Roma Taxi Service",
    },
    {
      pickup: "Trevi Fountain, Rome",
      dropoff: "Campo de' Fiori, Rome",
      status: "ongoing",
      fare: null,
      company: "Roma Taxi Service",
    },
    {
      pickup: "Piazza Navona, Rome",
      dropoff: "Castel Sant'Angelo, Rome",
      status: "accepted",
      fare: 15.0,
      company: "Roma Taxi Service",
    },
    {
      pickup: "Villa Borghese, Rome",
      dropoff: "Palatine Hill, Rome",
      status: "pending",
      fare: null,
      company: "Roma Taxi Service",
    },
    {
      pickup: "Capitoline Museums, Rome",
      dropoff: "Baths of Caracalla, Rome",
      status: "completed",
      fare: 18.75,
      company: "Roma Taxi Service",
    },
    {
      pickup: "Ostia Antica",
      dropoff: "EUR District, Rome",
      status: "cancelled",
      fare: null,
      company: "Roma Taxi Service",
    },

    // Milan bookings
    {
      pickup: "La Scala, Milan",
      dropoff: "Castello Sforzesco, Milan",
      status: "completed",
      fare: 8.5,
      company: "Milano Express",
    },
    {
      pickup: "Quadrilatero della Moda, Milan",
      dropoff: "Isola District, Milan",
      status: "ongoing",
      fare: null,
      company: "Milano Express",
    },
    {
      pickup: "Galleria Vittorio Emanuele II, Milan",
      dropoff: "Corso di Porta Ticinese, Milan",
      status: "accepted",
      fare: 14.0,
      company: "Milano Express",
    },
    {
      pickup: "Linate Airport, Milan",
      dropoff: "Centrale Station, Milan",
      status: "pending",
      fare: null,
      company: "Milano Express",
    },
    {
      pickup: "San Siro Stadium, Milan",
      dropoff: "Porta Garibaldi, Milan",
      status: "completed",
      fare: 22.0,
      company: "Milano Express",
    },
    {
      pickup: "Fieramilano",
      dropoff: "Citylife, Milan",
      status: "cancelled",
      fare: null,
      company: "Milano Express",
    },

    // Naples bookings
    {
      pickup: "Castel dell'Ovo, Naples",
      dropoff: "Piazza del Plebiscito, Naples",
      status: "completed",
      fare: 7.5,
      company: "Napoli Ride",
    },
    {
      pickup: "Royal Palace of Naples",
      dropoff: "Castel Nuovo, Naples",
      status: "ongoing",
      fare: null,
      company: "Napoli Ride",
    },
    {
      pickup: "Via dei Tribunali, Naples",
      dropoff: "Certosa di San Martino, Naples",
      status: "accepted",
      fare: 11.0,
      company: "Napoli Ride",
    },
    {
      pickup: "Palazzo Reale, Naples",
      dropoff: "Mergellina, Naples",
      status: "pending",
      fare: null,
      company: "Napoli Ride",
    },
    {
      pickup: "Capodimonte, Naples",
      dropoff: "Posillipo, Naples",
      status: "completed",
      fare: 16.5,
      company: "Napoli Ride",
    },
    {
      pickup: "Vesuvius",
      dropoff: "Herculaneum",
      status: "cancelled",
      fare: null,
      company: "Napoli Ride",
    },

    // Berlin bookings
    {
      pickup: "Reichstag, Berlin",
      dropoff: "Checkpoint Charlie, Berlin",
      status: "completed",
      fare: 11.5,
      company: "Berlin Taxi Union",
    },
    {
      pickup: "Museum Island, Berlin",
      dropoff: "East Side Gallery, Berlin",
      status: "ongoing",
      fare: null,
      company: "Berlin Taxi Union",
    },
    {
      pickup: "Hackescher Markt, Berlin",
      dropoff: "Prenzlauer Berg, Berlin",
      status: "accepted",
      fare: 9.0,
      company: "Berlin Taxi Union",
    },
    {
      pickup: "Tegel Airport, Berlin",
      dropoff: "Mitte, Berlin",
      status: "pending",
      fare: null,
      company: "Berlin Taxi Union",
    },
    {
      pickup: "Kreuzberg, Berlin",
      dropoff: "Charlottenburg, Berlin",
      status: "completed",
      fare: 13.75,
      company: "Berlin Taxi Union",
    },
    {
      pickup: "Friedrichshain, Berlin",
      dropoff: "Schöneberg, Berlin",
      status: "cancelled",
      fare: null,
      company: "Berlin Taxi Union",
    },

    // Munich bookings
    {
      pickup: "Viktualienmarkt, Munich",
      dropoff: "English Garden, Munich",
      status: "completed",
      fare: 9.5,
      company: "München Fahrdienst",
    },
    {
      pickup: "Nymphenburg Palace, Munich",
      dropoff: "Olympiapark, Munich",
      status: "ongoing",
      fare: null,
      company: "München Fahrdienst",
    },
    {
      pickup: "Schwabing, Munich",
      dropoff: "Maximilianstrasse, Munich",
      status: "accepted",
      fare: 12.0,
      company: "München Fahrdienst",
    },
    {
      pickup: "Franz Josef Strauss Airport, Munich",
      dropoff: "Altstadt, Munich",
      status: "pending",
      fare: null,
      company: "München Fahrdienst",
    },
    {
      pickup: "Deutsches Museum, Munich",
      dropoff: "Giesing, Munich",
      status: "completed",
      fare: 14.25,
      company: "München Fahrdienst",
    },
    {
      pickup: "Oktoberfest Grounds, Munich",
      dropoff: "Lehel, Munich",
      status: "cancelled",
      fare: null,
      company: "München Fahrdienst",
    },

    // Hamburg bookings
    {
      pickup: "Speicherstadt, Hamburg",
      dropoff: "Elbphilharmonie, Hamburg",
      status: "completed",
      fare: 8.0,
      company: "Hamburg City Rides",
    },
    {
      pickup: "Miniatur Wunderland, Hamburg",
      dropoff: "Blankenese, Hamburg",
      status: "ongoing",
      fare: null,
      company: "Hamburg City Rides",
    },
    {
      pickup: "Planten un Blomen, Hamburg",
      dropoff: "Ottensen, Hamburg",
      status: "accepted",
      fare: 10.5,
      company: "Hamburg City Rides",
    },
    {
      pickup: "Hamburg Airport",
      dropoff: "Eimsbüttel, Hamburg",
      status: "pending",
      fare: null,
      company: "Hamburg City Rides",
    },
    {
      pickup: "Fish Market, Hamburg",
      dropoff: "Winterhude, Hamburg",
      status: "completed",
      fare: 12.0,
      company: "Hamburg City Rides",
    },
    {
      pickup: "Port of Hamburg",
      dropoff: "Harvestehude, Hamburg",
      status: "cancelled",
      fare: null,
      company: "Hamburg City Rides",
    },
  ];

  // Create additional bookings
  for (const booking of additionalBookings) {
    const company = getCompany(booking.company);
    const companyCustomers = createdAdditionalCustomers.filter(
      (c) => c.companyName === booking.company
    );
    const companyDrivers = allDrivers.filter(
      (d) => d.company.name === booking.company
    );

    if (companyCustomers.length === 0 || companyDrivers.length === 0) continue;

    const randomCustomer =
      companyCustomers[Math.floor(Math.random() * companyCustomers.length)];
    const randomDriver =
      booking.status !== "pending"
        ? companyDrivers[Math.floor(Math.random() * companyDrivers.length)]
        : null;

    await prisma.booking.create({
      data: {
        customerId: randomCustomer.id,
        driverId: randomDriver?.id || null,
        companyId: company.id,
        pickup: booking.pickup,
        dropoff: booking.dropoff,
        status: booking.status,
        fare: booking.fare,
        requestedAt: new Date(
          Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000
        ), // Random time in last 14 days
      },
    });
  }

  // Add more company media
  const additionalMedia = [
    {
      company: "Roma Taxi Service",
      type: "DOCUMENT",
      url: "https://example.com/documents/roma-taxi-license.pdf",
    },
    {
      company: "Milano Express",
      type: "DOCUMENT",
      url: "https://example.com/documents/milano-express-insurance.pdf",
    },
    {
      company: "Napoli Ride",
      type: "DOCUMENT",
      url: "https://example.com/documents/napoli-ride-permit.pdf",
    },
    {
      company: "Berlin Taxi Union",
      type: "DOCUMENT",
      url: "https://example.com/documents/berlin-taxi-certification.pdf",
    },
    {
      company: "München Fahrdienst",
      type: "DOCUMENT",
      url: "https://example.com/documents/muenchen-fahrdienst-license.pdf",
    },
    {
      company: "Hamburg City Rides",
      type: "DOCUMENT",
      url: "https://example.com/documents/hamburg-rides-permit.pdf",
    },
  ];

  for (const media of additionalMedia) {
    const company = getCompany(media.company);

    if (!company) {
      console.error(`❌ Skipping media - company not found: ${media.company}`);
      continue;
    }

    try {
      await prisma.companyMedia.create({
        data: {
          companyId: company.id,
          type: media.type,
          url: media.url,
        },
      });
      console.log(`✅ Added media for: ${media.company}`);
    } catch (error) {
      console.error(
        `❌ Error adding media for ${media.company}:`,
        error.message
      );
    }
  }

  // Add secondary addresses for some companies
  const secondaryAddresses = [
    {
      company: "Roma Taxi Service",
      address: {
        street: "Via Appia Nuova, 456",
        city: "Rome",
        state: "Lazio",
        country: "Italy",
        postalCode: "00179",
        isPrimary: false,
      },
    },
    {
      company: "Milano Express",
      address: {
        street: "Viale Monza, 78",
        city: "Milan",
        state: "Lombardy",
        country: "Italy",
        postalCode: "20125",
        isPrimary: false,
      },
    },
    {
      company: "Berlin Taxi Union",
      address: {
        street: "Friedrichstraße, 200",
        city: "Berlin",
        state: "Berlin",
        country: "Germany",
        postalCode: "10117",
        isPrimary: false,
      },
    },
  ];

  for (const addressData of secondaryAddresses) {
    const company = getCompany(addressData.company);

    if (!company) {
      console.error(
        `❌ Skipping address - company not found: ${addressData.company}`
      );
      continue;
    }

    try {
      await prisma.companyAddress.create({
        data: {
          companyId: company.id,
          ...addressData.address,
        },
      });
      console.log(`✅ Added secondary address for: ${addressData.company}`);
    } catch (error) {
      console.error(
        `❌ Error adding address for ${addressData.company}:`,
        error.message
      );
    }
  }

  console.log("✅ Additional data added successfully!");
  console.log("📊 Summary of additions:");
  console.log(`• ${allAdditionalDrivers.length} Additional Drivers`);
  console.log(`• ${additionalUsers.length} Additional Users`);
  console.log(`• ${additionalCustomers.length} Additional Customers`);
  console.log(`• ${additionalBookings.length} Additional Bookings`);
  console.log(`• ${additionalMedia.length} Additional Company Documents`);
  console.log(`• ${secondaryAddresses.length} Secondary Company Addresses`);
  console.log(`• Driver availabilities for next 5 days`);
  console.log(`• Location tracking for online drivers`);

  // Final statistics
  const totalDrivers = await prisma.driver.count();
  const totalCustomers = await prisma.customer.count();
  const totalBookings = await prisma.booking.count();
  const totalUsers = await prisma.user.count();

  console.log("\n🎯 Total Database Statistics:");
  console.log(`• ${totalDrivers} Total Drivers`);
  console.log(`• ${totalCustomers} Total Customers`);
  console.log(`• ${totalBookings} Total Bookings`);
  console.log(`• ${totalUsers} Total Users`);
  console.log(`• ${companies.length} Companies across Italy & Germany`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
