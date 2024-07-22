const { Client } = require("basic-ftp");
const { Logger } = require('../helpers/logger');
require('dotenv').config();

connect().then((data) => console.log(data)).catch((e) => console.error(e));

async function connect() {
    const client = new Client()
    client.ftp.verbose = true
    try {
        const ftpResponse = await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false,
        })
        Logger.info(ftpResponse.message);
        return client;
    }
    catch(err) {
        Logger.error(err)
        throw err;
    }
}

module.exports.FTPClient = {
    connect: connect()
};
