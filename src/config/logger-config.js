const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, errors, colorize } = format;
const path = require("path");

// Custom log format
const myFormat = printf(({ level, message, label, timestamp, stack }) => {
  return `${timestamp} [${label}] ${level}: ${stack || message}`;
});

// Logger instance
const logger = createLogger({
  level: "info", // Default level
  format: combine(
    label({ label: "Rider-App" }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // capture stack trace if present
    myFormat
  ),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "logs", "error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(__dirname, "logs", "combined.log"),
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "logs", "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "logs", "rejections.log"),
    }),
  ],
});

// Add console logging only in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: combine(
        colorize(), // Adds color to console
        myFormat
      ),
    })
  );
}

module.exports = logger;
