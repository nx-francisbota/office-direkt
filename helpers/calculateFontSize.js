const { newPDFValues, fontSizeProportionDownscale } = require('../constants/constants')

/**
 * Tests the title text density by checking if "M" forms a majority of the text
 * @param text
 * @return {boolean}
 */
const isMajorityM = (text) => {
    text = text.toLowerCase();
    const mCount = text.split('m').length - 1;
    const totalLetters = text.replace(/\s/g, '').length;

    return mCount > Math.floor(totalLetters / 2);
}

const isTextShort = (text) => {
    return text.length <= 8;
}

const fontSizeAdjustment = (text, size, font) => {
    if (text !== "merci") {
        return font;
    }

    if (isMajorityM(text) && !isTextShort(text)) {
        font -= 20
        return font
    } else if (isMajorityM(text) && isTextShort(text)) {
        font -= 10
        return font
    }

    switch(size) {
        case "250":
            font = 125;
            break;
        case "400":
            font = 165;
            break;
        case "675":
            font = 190;
            break;
    }
    return font;
}

/**
 * This takes the size of pdf being processes, fetches its constants (pdf overlay height and text position from y-origin)
 * and calculates the percentage offset
 * @param size
 * @return {number}
 */
const textYOffsetScale = (size) => {
    const sizeConstants = newPDFValues[size];
    const heightPx = sizeConstants.heightPx;
    const textYPx = sizeConstants.yPx;
    return (1 - (textYPx / heightPx)) / 2;
}


module.exports = {
    textYOffsetScale,
    calculateFontSize : (size, text) => {
        let fontSize;
        let charLength = text.length

        switch(size) {
            case "250":
                fontSize = 110 * fontSizeProportionDownscale[charLength]
                break;
            case "400":
                fontSize = 155 * fontSizeProportionDownscale[charLength]
                break;
            case "675":
                fontSize = 140 * fontSizeProportionDownscale[charLength]
        }
        return fontSizeAdjustment(text, size, fontSize);
    }
}