import winston from "winston";

const logger = winston.createLogger({
  level: 'info', // Lowest level to log (info, warn, error)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Logs in JSON for better analysis
  ),
  transports: [
    new winston.transports.Console(), // Log to terminal
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Separate file for errors
    new winston.transports.File({ filename: 'logs/combined.log' }), // All logs
  ],
});
export default logger;