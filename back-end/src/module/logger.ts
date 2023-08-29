const winston = require('winston');

// Configurazione dei trasporti per la scrittura dei log
const transports = [
  new winston.transports.Console(), // Log su console
  new winston.transports.File({ filename: './log/error.log', level: 'error' }), // Log degli errori su file
  new winston.transports.File({ filename: './log/combined.log' }), // Log generale su file
];

// Creazione dell'istanza del logger
const logger = winston.createLogger({
  level: 'info', // Livello minimo di log da visualizzare
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports,
});

module.exports = logger;
