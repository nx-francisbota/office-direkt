const { PDFDocument, rgb, cmyk } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { countAndFindLastI, splitToLastI, makeLastIDotless } = require('../utils/heartSvgUtilities');
const { generatePdfWithBarcode } = require('../helpers/barcodeGenerator');
const { addMediaAndBleedBox } = require('../helpers/pdfIntegrationInfo');
const { calculateFontSize, sizeMap } = require('../helpers/calculateFontSize');
const { pdfConstants  } = require('../constants/constants');
const fontBytes = fs.readFileSync(path.join(__dirname, '../public/assets/fonts/MerciLogo-Regular2019.otf'));
const svgHeart = fs.readFileSync(path.join(__dirname, '../public/assets/merci-herz-small.png'));

/**
 * @param jsonData
 * @param file string
 */
exports.regeneratePdfFiles = async (jsonData, file) => {
    let { titleText } = jsonData;
    const defaultText = "merci";

    //use merci as default text where empty
    if (!titleText) {
        titleText = defaultText
    }
    titleText = titleText.toLowerCase();


    const processingRecords = {
        fixed: [],
        failed: [],
    }
    const { size, guid, productNumber, orderNumber, quantity } = jsonData;

    if (!quantity
    ||
    !orderNumber) {
        logger.error(`Item quantity, product number or order number missing from json for file ${file.name}`);
        processingRecords.failed.push(file);
        return processingRecords;
    }

    const textInformation = countAndFindLastI(titleText);
    let fontSize = calculateFontSize(size, titleText);
    const pdfPath = path.resolve(__dirname, file);
    const pdfBuffer = fs.readFileSync(pdfPath);

    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);

        //Register font kit instance
        pdfDoc.registerFontkit(fontkit);

        //Embed custom font and SVG
        const arcaneFont = await pdfDoc.embedFont(fontBytes);
        const embeddedPng = await pdfDoc.embedPng(svgHeart);

        logger.info(`${file} successfully loaded. Adding new text...`);

        //check if pdf size is accounted for
        if (!pdfConstants[size]) {
            logger.error(`PDF size ${size} assigned to ${orderNumber} is not recognized`);
            processingRecords.failed.push(file);
            return processingRecords;
        }

        const pdfPage = (await pdfDoc).getPage(0);
        const pdfWidth = pdfPage.getWidth();
        let textWidth = arcaneFont.widthOfTextAtSize(titleText, fontSize);
        let textHeight = arcaneFont.heightAtSize(fontSize);
        const y = pdfConstants[size].y;
        let offsetX = (pdfWidth - textWidth) / 2;
        let svgHeartOffset;
        let svgScale = arcaneFont.widthOfTextAtSize("i", fontSize);

        //set bleed box
        addMediaAndBleedBox(pdfPage);

        const charactersUntilLastI = splitToLastI(titleText);
        titleText = makeLastIDotless(titleText);
        if (charactersUntilLastI.length !== 0) {
            const sizeArr = charactersUntilLastI.map(t => arcaneFont.widthOfTextAtSize(t, fontSize));
            const heartWidthOffset = sizeArr.reduce((x, y) => {
                return x + y
            });
            svgHeartOffset = heartWidthOffset + offsetX - svgScale;
        } else {
            svgHeartOffset = offsetX + textWidth - 15;
        }

        pdfPage.drawText(titleText, {
            x: offsetX,
            y,
            size: fontSize,
            color: cmyk(1, 1, 1, 1),
            font: arcaneFont,
        })

        //add .9999 adjustment to center heart a bit more that in output 🤷‍♂️
        let svgDrawOptions = {
            x: svgHeartOffset * 0.9999,
            y: y + svgYAdjustment(fontSize, size, textHeight),
            color: cmyk(0, 0, 0, 0),
            width: svgScale,
            height: svgScale * 0.92,
        };

        if (textInformation.count > 0) {
            pdfPage.drawRectangle(svgDrawOptions)
            pdfPage.drawImage(embeddedPng, svgDrawOptions)
        } else {
            pdfPage.drawImage(embeddedPng, svgDrawOptions)
        }

        await generatePdfWithBarcode({productNumber, orderNumber}, pdfDoc);

        const mod = await pdfDoc.save();
        const fixedFiles = processingRecords.fixed;

        for (let i=1; i <= quantity; i++) {
            const filePath = `${__dirname}/../public/pdf/${orderNumber}_${guid}-${size}g-${i}.pdf`
            fs.writeFileSync(filePath, mod);
            fixedFiles.push(filePath);
        }
        logger.info(`Processing complete. Text successfully added to ${orderNumber}_${guid}-${size}g`);
    } catch (e) {
        processingRecords.failed.push(file)
        logger.error(`Error adding title text to pdf file ${orderNumber}-${guid} : ${e}. Finding new file...`);
    }
    return processingRecords
}


const svgYAdjustment = (fontSize, pdfSize, textHeight) => {
    let yAdjustment = (textHeight / 2) - 5;
    if (pdfSize === "250") {
        if (fontSize === 30 || fontSize === 35) {
            yAdjustment = (textHeight / 2) - 2;
        }
    } else if (pdfSize === "675") {
        if (fontSize === 130) {
            yAdjustment = (textHeight / 2) - 6;
        }
    }
    return yAdjustment;
}
