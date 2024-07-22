// const { mmToLibUnit } = require("./millimetreToLibUnitConverter");

const mmToLibUnit = (mmUnit) => {
    //1lib-unit = 1/72 inch
    //1mm = 0.0393701inches
    //1lib-unit = 0.35278mm
    //2.8352lib-units = 1mm
    return mmUnit * 2.8352;
}

const addMediaAndBleedBox = (pdfPage) => {
    const mediaBoxSize = mmToLibUnit(5);
    const bleedSize = mmToLibUnit(3);
    const pdfWidth = pdfPage.getWidth();
    const pdfHeight = pdfPage.getHeight();
    const mediaBoxWidth = (2 * mediaBoxSize) + pdfWidth;
    const mediaBoxHeight = (2 * mediaBoxSize) + pdfHeight;
    const bleedWidth = (2 * bleedSize) + pdfWidth;
    const bleedHeight = (2 * bleedSize) + pdfHeight;

    //set media box
    pdfPage.setMediaBox((-1 * mediaBoxSize), (-1 * mediaBoxSize), mediaBoxWidth, mediaBoxHeight);
    //set bleed box
    pdfPage.setBleedBox((-1 * bleedSize), (-1 * bleedSize), bleedWidth, bleedHeight);
}

module.exports = {
    mmToLibUnit,
    addMediaAndBleedBox
}