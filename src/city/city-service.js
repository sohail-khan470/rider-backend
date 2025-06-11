const { PrismaClient } = require("@prisma/client");

class CityService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCity(createCityDto) {
    try {
      return await this.prisma.city.create({
        data: {
          name: createCityDto.name,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        throw new Error("A city with this name already exists");
      }
      throw new Error(`Failed to create city: ${error.message}`);
    }
  }

  async getAllCities(options = {}) {
    // const page = options.page || 1;
    // const limit = options.limit || 10;
    // const skip = (page - 1) * limit;

    try {
      const [cities, total] = await this.prisma.$transaction([
        this.prisma.city.findMany({
          // skip,
          // take: limit,
          orderBy: {
            name: "asc",
          },
        }),
        this.prisma.city.count(),
      ]);

      return {
        data: cities,
        // meta: {
        //   total,
        //   page,
        //   limit,
        //   totalPages: Math.ceil(total / limit),
        // },
      };
    } catch (error) {
      throw new Error(`Failed to fetch cities: ${error.message}`);
    }
  }

  async getCityById(id) {
    try {
      const city = await this.prisma.city.findUnique({
        where: { id: Number(id) },
      });

      if (!city) {
        throw new Error("City not found");
      }

      return city;
    } catch (error) {
      if (error.message === "City not found") {
        throw error;
      }
      throw new Error(`Failed to fetch city: ${error.message}`);
    }
  }

  async updateCity(id, updateCityDto) {
    try {
      const city = await this.prisma.city.update({
        where: { id: Number(id) },
        data: {
          name: updateCityDto.name,
          updatedAt: new Date(),
        },
      });

      return city;
    } catch (error) {
      // Handle not found errors
      if (error.message.includes("Record to update not found")) {
        throw new Error("City not found");
      }
      // Handle unique constraint violations
      if (error.code === "P2002") {
        throw new Error("A city with this name already exists");
      }
      throw new Error(`Failed to update city: ${error.message}`);
    }
  }

  async deleteCity(id) {
    try {
      // Check if there are any drivers associated with this city
      const driversCount = await this.prisma.driver.count({
        where: { cityId: Number(id) },
      });

      if (driversCount > 0) {
        throw new Error("Cannot delete city with associated drivers");
      }

      await this.prisma.city.delete({
        where: { id: Number(id) },
      });

      return { success: true, message: "City deleted successfully" };
    } catch (error) {
      // Handle not found errors
      if (error.message.includes("Record to delete not found")) {
        throw new Error("City not found");
      }
      throw new Error(`Failed to delete city: ${error.message}`);
    }
  }

  async searchCities(query) {
    try {
      const cities = await this.prisma.city.findMany({
        where: {
          name: {
            contains: query,
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return cities;
    } catch (error) {
      throw new Error(`Failed to search cities: ${error.message}`);
    }
  }
}

module.exports = new CityService();
