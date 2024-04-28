import * as winston from 'winston';

//TODO Sistemarlo (info solo info etc) e aggiungere i colori
// Configurazione dei trasporti per la scrittura dei log
const transports = [
  new winston.transports.Console(), // Log su console
  new winston.transports.File({
    filename: './storage/log/error.log',
    level: 'error',
  }), // Log degli errori su file
  new winston.transports.File({
    filename: './storage/log/info.log',
    level: 'info',
  }), // Log degli info su file
];

// Creazione dell'istanza del logger
export const logger = winston.createLogger({
  level: 'info', // Livello minimo di log da visualizzare
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    }),
  ),
  transports,
});
