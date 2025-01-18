const winston = require("winston");
const Transport = require('winston-transport');

//setting up logger
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

//defining logger transports
class CustomTransport_SSE extends Transport {
    constructor(opts) {
        super(opts);
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        info.res.write(`data: ${info.message}\n\n`);
        callback();
    }
};

class GuildedBotTransport extends Transport {
    constructor(opts) {
        super(opts);
    }
    async log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });
        try {
            await info.res.edit(`${info.res.content}\n${info.message}`);
            callback();
        } catch (error) {
            console.error(error)
            callback(error);
        }
    }
};

module.exports = { logger, CustomTransport_SSE, GuildedBotTransport }