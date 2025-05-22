const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

const italianCities = [
  { id: 1, name: "Rome" },
  { id: 2, name: "Milan" },
  { id: 3, name: "Naples" },
  { id: 4, name: "Florence" },
  { id: 5, name: "Venice" },
];

const companyId = 1;

async function seedDriversAndAvailability() {
  for (let i = 0; i < 20; i++) {
    const city = faker.helpers.arrayElement(italianCities);
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(" ")[0] });
    const phone = faker.phone.number("+39 3#########");
    const vehicleInfo = `${faker.vehicle.manufacturer()} ${faker.vehicle.model()}`;

    const driver = await prisma.driver.create({
      data: {
        name,
        email,
        phone,
        status: "offline",
        vehicleInfo,
        companyId,
        cityId: city.id,
        timezone: "Europe/Rome",
        location: {
          create: {
            lat: parseFloat(faker.location.latitude({ max: 45, min: 37 })),
            lng: parseFloat(faker.location.longitude({ max: 15, min: 6 })),
          },
        },
        availability: {
          create: [
            {
              startTime: faker.date.soon({ days: 1 }),
              endTime: faker.date.soon({
                days: 1,
                refDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
              }), // +2hr
            },
          ],
        },
      },
    });

    console.log(`✅ Created driver: ${driver.name}`);
  }
}

async function seedCustomersAndBookings() {
  for (let i = 0; i < 20; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({ firstName: name.split(" ")[0] });
    const phone = faker.phone.number("+39 3#########");

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        companyId,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        companyId,
        pickup: faker.location.streetAddress({ useFullAddress: true }),
        dropoff: faker.location.streetAddress({ useFullAddress: true }),
        status: "pending",
        fare: parseFloat(faker.commerce.price({ min: 10, max: 100 })),
      },
    });

    console.log(
      `✅ Created customer: ${customer.name} with booking ID: ${booking.id}`
    );
  }
}

async function main() {
  console.log("🚀 Seeding started...");
  await seedDriversAndAvailability();
  await seedCustomersAndBookings();
  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
