const pino = require('pino');
const dateFns = require('date-fns');

const transport = pino.transport({
    targets:[
        {
        level: 'info',
        target: 'pino-pretty',
        },
        {
         level: 'error',
         target: 'pino-pretty'
        },
        {
            level: 'trace',
            target: 'pino/file',
            translateTime: true,
            options: {
                destination: `${__dirname}/../logs/app.log`,
                ignore: 'pid,hostname'
            }
        }
        ]
})


exports.logger = pino(
    {
        level     : "info",
        timestamp : () =>
            `,"time":"${dateFns.format(Date.now(), "dd-MMM-yyyy HH:mm:ss sss")}"`,
    },
    transport
);




