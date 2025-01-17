const winston = require("winston");
// const { appendEditTimeout } = await import("./bot.js");

// const botTransport = {
//     log: async (info, callback, GuildedMessage) => {
//         // Your custom logging logic goes here
//         // console.log(`Custom transport: ${info.level} - ${info.message}`);
//         try {
//             await appendEditTimeout(GuildedMessage, info.message);
//         } catch (error) {
//             console.error(error)
//             callback(error);
//         }
//         // Call the callback to signal that the log has been processed
//     },
// };

const logger = winston.createLogger({
    level: 'info', // Default logging level
    format: winston.format.combine(
        winston.format.timestamp(), // Adds a timestamp
        winston.format.json()       // Logs in JSON format
    ),

    transports: [
        new winston.transports.Console(), // Logs to the console
        new winston.transports.File({ filename: 'logs/app.log' }), // Logs to a file
        // botTransport,
    ],
});

module.exports = { logger }