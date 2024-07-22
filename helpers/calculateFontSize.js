const { logger } = require('../utils/logger');

//check the text to see if M is the majority letter
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


module.exports = {
    calculateFontSize : (size, text) => {
        let fontSize;
        let charLength = text.length

        switch(size) {
            case "250":
                if (charLength >= 1 && charLength <= 8) {
                    fontSize = 110;
                } else if (charLength >= 9 && charLength <= 13) {
                    fontSize = 80;
                } else if (charLength >= 14 && charLength <= 15) {
                    fontSize = 50;
                } else {
                    logger.info("Text length is outside the defined ranges.")
                    fontSize = 25
                }
                break;
            case "400":
                if (charLength >= 1 && charLength <= 8) {
                    fontSize = 155;
                } else if (charLength >= 9 && charLength <= 13) {
                    fontSize = 120;
                } else if (charLength >= 14 && charLength <= 15) {
                    fontSize = 90;
                } else {
                    logger.info("Text length is outside the defined ranges.")
                    fontSize = 40
                }
                break;
            case "675":
                if (charLength >= 1 && charLength <= 8) {
                    fontSize = 180;
                } else if (charLength >= 9 && charLength <= 13) {
                    fontSize = 110;
                } else if (charLength >= 14 && charLength <= 15) {
                    fontSize = 100;
                } else {
                    logger.info("Text length is outside the defined ranges.")
                    fontSize = 40
                }
        }
        return fontSizeAdjustment(text, size, fontSize);
    }
}