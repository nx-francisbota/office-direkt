const { PDFDocument, rgb, cmyk } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');
const { countAndFindLastI, splitToLastI, makeLastIDotless } = require('../utils/heartSvgUtilities');
const { generatePdfWithBarcode } = require('../helpers/barcodeGenerator');
const { addMediaAndBleedBox } = require('../helpers/pdfIntegrationInfo');
const { textYOffsetScale, calculateFontSize } = require('../helpers/calculateFontSize');
const { pdfConstants, svgAdjustmentFactors } = require('../constants/constants');
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

    /**
     * This holds records of the file if its fixed, failed processing, or regenerated
     * fixed - original file name
     * failed - original file name
     * regenerated - original file name + size + index
     */
    const processingRecords = {
        fixed: [],
        failed: [],
        regen: [],
    }
    const { size, guid, productNumber, orderNumber, quantity } = jsonData;

    if (!quantity || !orderNumber || !productNumber) {
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
        const pdfHeight = pdfPage.getHeight();
        let textWidth = arcaneFont.widthOfTextAtSize(titleText, fontSize);
        let textHeight = arcaneFont.heightAtSize(fontSize);
        const y = pdfHeight * textYOffsetScale(size);
        let offsetX = (pdfWidth - textWidth) / 2;
        let svgHeartOffset;
        let svgScaleX = arcaneFont.widthOfTextAtSize("i", fontSize);

        //set bleed box
        addMediaAndBleedBox(pdfPage);

        const charactersUntilLastI = splitToLastI(titleText);
        titleText = makeLastIDotless(titleText);
        if (charactersUntilLastI.length !== 0) {
            const textWidthAtFontArray = charactersUntilLastI.map(t => arcaneFont.widthOfTextAtSize(t, fontSize));
            const textWidthUpToLastI = textWidthAtFontArray.reduce((x, y) => {
                return x + y
            });
            svgHeartOffset = textWidthUpToLastI + offsetX - svgScaleX;
        } else {
            svgHeartOffset = offsetX + textWidth - (svgScaleX * 0.6);
        }

        pdfPage.drawText(titleText, {
            x: offsetX,
            y,
            size: fontSize,
            color: cmyk(1, 1, 1, 1),
            font: arcaneFont,
        })

        let svgDrawOptions = {
            x: svgHeartOffset * 0.9999,
            y: y + svgYAdjustment(fontSize, size, textHeight, titleText.length),
            color: cmyk(0, 0, 0, 0),
            width: svgScaleX,
            height: svgScaleX * 0.92,
        };

        pdfPage.drawImage(embeddedPng, svgDrawOptions)

        //Generate Barcode Page Data
        await generatePdfWithBarcode({productNumber, orderNumber, pdfWidth, pdfHeight}, pdfDoc);

        const serializedBuffer = await pdfDoc.save();

        for (let i=1; i <= quantity; i++) {
            const filePath = `${__dirname}/../public/pdf/${orderNumber}_${guid}-${size}g-${i}.pdf`
            fs.writeFileSync(filePath, serializedBuffer);
            processingRecords.regen.push(filePath);
        }
        logger.info(`Processing complete. Text successfully added to ${orderNumber}_${guid}-${size}g`);
        processingRecords.fixed.push(file)
    } catch (e) {
        processingRecords.failed.push(file)
        logger.error(`Error processing pdf file ${orderNumber}-${guid} : ${e}. Finding new file...`);
    }
    return processingRecords
}


const svgYAdjustment = (fontSize, pdfSize, textHeight, textLength) => {
    let yAdjustment = (textHeight / 2) - 5;
    let factor = 1;
    if (textLength >=8 && textLength <= 11) {
        factor = svgAdjustmentFactors[1];
    } else if (textLength >= 12 && textLength <= 15) {
        factor = svgAdjustmentFactors[2]
    }

    return yAdjustment * factor;
}
