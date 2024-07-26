const { newPDFValues, fontSizeProportionDownscale } = require('../constants/constants')


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
                fontSize = 135 * fontSizeProportionDownscale[charLength]
                break;
            case "400":
                fontSize = 175 * fontSizeProportionDownscale[charLength]
                break;
            case "675":
                fontSize = 230 * fontSizeProportionDownscale[charLength]
        }
        return fontSize;
    }
}