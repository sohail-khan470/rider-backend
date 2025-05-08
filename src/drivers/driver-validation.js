const { z } = require("zod");

const createDriverSchema = z.object({
  name: z.string().min(2, "Driver name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  vehicleInfo: z.string().min(5, "Vehicle info must be at least 5 characters"),
  companyId: z.number().int().positive("Company ID must be a positive integer"),
  status: z
    .enum(["offline", "online", "on_trip"])
    .optional()
    .default("offline"),
});

const updateDriverSchema = z.object({
  name: z
    .string()
    .min(2, "Driver name must be at least 2 characters")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .optional(),
  vehicleInfo: z
    .string()
    .min(5, "Vehicle info must be at least 5 characters")
    .optional(),
  status: z.enum(["offline", "online", "on_trip"]).optional(),
  companyId: z
    .number()
    .int()
    .positive("Company ID must be a positive integer")
    .optional(),
});

const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const createAvailabilitySchema = z
  .object({
    driverId: z.number().int().positive(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

module.exports = {
  createDriverSchema,
  updateDriverSchema,
  updateLocationSchema,
  createAvailabilitySchema,
};
