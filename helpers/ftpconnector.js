const { Client } = require("basic-ftp")
const fs = require('fs');
const path = require('path');
const {logger} = require('../utils/logger');
const { regeneratePdfFiles } = require('../scripts/regeneratePDF');
require('dotenv').config({
    path: '../.env'
})

const host = process.env.FTP_HOST;
const user = process.env.FTP_USER;
const password = process.env.FTP_PASSWORD;
const remoteDir = process.env.REMOTE_DIRECTORY
const printOutput = process.env.REMOTE_OUTPUT
const pathToScanTimeFile = '/../public/pdf/LASTSCAN';
const pathToLocalDir = '/../public/pdf/';
const pathToCurrentFile = '/../public/pdf/CURRENT';
const successDir = process.env.SUCCESS_DIR;
const failDir = process.env.ERROR_DIR;


exports.scanDir = async function () {
    const client = new Client();
    let lastScanDate = await readOrCreateFile(__dirname + pathToScanTimeFile)
    let lastScanTime = new Date(lastScanDate).valueOf();

    try {
        await client.access({
            host, user: user, password,
        });

        logger.info('Connected to FTP server');

        const scannedDate = new Date();
        const files = await client.list(remoteDir);

        // Filter for PDF files
        const pdfFiles = files.filter((file) => file.type === 1 && file.name.toLowerCase().endsWith('.pdf'));

        if (!pdfFiles.length) {
            logger.error("No pdf files detected in the server directory");
            return
        }

        // Identify new PDFs by comparing modification times with last scan
        const newlyAdded = pdfFiles.filter((file) => {
            const fileModifiedDate = new Date(file.modifiedAt);
            let fileModifiedTime = new Date(fileModifiedDate).valueOf();

            if(!lastScanTime) {
                return true;
            }
            return fileModifiedTime > lastScanTime;
        });

        if (newlyAdded.length > 0) {
             logger.info(`${newlyAdded.length} New PDFs found:`);
            for (const file of newlyAdded) {

                const pdfPath = __dirname + '/../public/pdf/' + file.name;
                const jsonPath = __dirname + '/../public/pdf/' + getPdfJson(file.name);

                await downloadFileAndJson(file, client)

                //get json content
                const json = await readJsonFile(__dirname + pathToLocalDir + getPdfJson(file.name))
                //if there is no json upload
                if (!json) {
                    //do something if file missing
                    await uploadFile(client, __dirname + pathToLocalDir + file.name, failDir)
                    await deleteFile(pdfPath);
                    await deleteFile(jsonPath);
                    await createFile(__dirname + pathToScanTimeFile, scannedDate.toString())
                }

                //load file content in an object
                const jsonData = getJsonInfo(json);

                //create the Current file and save the filename in it
                createFile(__dirname + pathToCurrentFile, file.name);

                //perform action on temp file
                const currentFilePath = __dirname + pathToLocalDir + file.name;
                const processingRecords = await regeneratePdfFiles(jsonData, currentFilePath)
                const fixedFile = processingRecords.fixed[0];
                const failedFile = processingRecords.failed[0];
                const regenFiles = processingRecords.regen;

                if (regenFiles.length > 0) {
                    for (const filePath of regenFiles) {
                        logger.info(`Uploading file at ${filePath}`);

                        await uploadFile(client, filePath, printOutput);
                    }
                    regenFiles.map((file) => deleteFile(file));
                }

                if (fixedFile) {
                    logger.info(`Uploading file at ${fixedFile}`);
                    await uploadFile(client, fixedFile, successDir);
                }

                if (failedFile) {
                    logger.info(`Uploading file at ${failedFile}`)
                    await uploadFile(client, failedFile, failDir);
                }

                //delete CURRENT file
                await deleteFile(__dirname + pathToCurrentFile);

                //remove pdf and json files from local
                await deleteFile(pdfPath);
                await deleteFile(jsonPath);
            }
        } else {
             logger.info('No new PDFs found.');
        }
        // Update last scan time for future comparisons
        await createFile(__dirname + pathToScanTimeFile, scannedDate.toString())
        logger.info("Scan Successfully completed");
    } catch (error) {
        logger.trace(error)
    } finally {
        await client.close();
    }
}


function getPdfJson(fileName) {
    const name = fileName.slice(0, -4);
    return name + '.json';
}


function createFile(fileName, content) {
    try {
        fs.writeFile(fileName, content, (err) => {
            if (err) {
                throw err;
            } else {
                 logger.info(`File "${fileName}" created successfully!`);
            }
        });
    } catch (error) {
        console.error('Error creating file:', error);
    }
}

async function uploadFile(client, filePath, remoteDir) {
    const filename = path.basename(filePath);
    try {
        if (remoteDir) {
            await client.ensureDir(remoteDir)
            await client.uploadFrom(filePath, filename);
            await client.cd('../')
        } else {
            await client.uploadFrom(filePath, filename);
        }
    } catch (e) {
        logger.error(`${e.code}: Error uploading File ${e.message}`);
        if (e.code > 300) {
            logger.info(`Removing ${filename} from upload queue...`)
            await deleteFile(__dirname + '/../public/pdf/' + filename);
            await deleteFile(__dirname + '/../public/pdf/' + getPdfJson(filename));
            logger.info(`${filename} successfully removed from upload queue!`)
        }
    }
}


async function deleteFile(fileName) {
    try {
        await fs.unlink(fileName, () => {
             logger.info(`File "${fileName}" deleted successfully!`);
        });
    } catch (err) {
        console.error('Error deleting file:', err);
    }
}

/**
 * Traces and downloads the pdf file, and it's accompanying pdf
 * @param file
 * @param client
 */
async function downloadFileAndJson(file, client) {
    try {
        await client.cd(remoteDir)
        // Download the file
        logger.info(`Start downloading PDF file: ${file.name}`);
        await client
            .downloadTo(__dirname + pathToLocalDir + file.name, file.name)
            .catch((error) => {
                logger.error("Error downloading file:", error);
                throw error;
            });
        // Download its JSON
        logger.info(`Start downloading JSON file: ${getPdfJson(file.name)}`);
        await client
            .downloadTo(__dirname + pathToLocalDir + getPdfJson(file.name), getPdfJson(file.name))
            .catch((error) => {
                logger.error(`Error downloading JSON: ${file.name}_______${error}__________`);
            });
        logger.info("PDF file and JSON downloaded successfully!");
    } catch (error) {
        logger.error("An error occurred:", error);
    }
}

/**
 * Parses the accompanying json file and reads its content
 * @param filePath
 */
async function readJsonFile(filePath) {
    try {
        const data = readFile(filePath)
        return JSON.parse(await data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.error(`Error: File '${filePath}' not found.`);
            return null;
        } else if (error.name === 'SyntaxError') {
            logger.error(`Error: Failed to parse '${filePath}' as JSON.`);
            return null;
        } else {
            logger.error('Unexpected error:', error);
            return null;
        }
    }
}

/**
 * Asynchronously reads the content of the file in the specified path
 * @param filePath
 */
async function readFile(filePath) {
    return await fs.promises.readFile(filePath, 'utf8');
}

/**
 * Checks for the existence of a file and creates it in its absence
 * @param filePath
 */
async function readOrCreateFile(filePath) {
    try {
        return await fs.promises.readFile(filePath, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.warn(`File not found. Creating it at ${filePath}`);
            await fs.promises.writeFile(filePath, '', 'utf8');
            return '';
        } else {
            throw error;
        }
    }
}


/**
 * Extracts relevant information from a JSON object.
 * @param {Object} jsonObject - The JSON object to extract information from.
 * @returns {Object} An object containing the extracted information.
 */
const getJsonInfo = (jsonObject) => {
    if (!jsonObject) {
        logger.error("Invalid or null JSON file read");
        return {};
    }

    return {
        titleText: jsonObject.titleText || undefined,
        size: jsonObject.size,
        productNumber: jsonObject.productNumber || undefined,
        orderNumber: jsonObject.orderNumber || undefined,
        quantity: jsonObject.quantity || undefined,
        guid: jsonObject.printId || undefined
    };
};