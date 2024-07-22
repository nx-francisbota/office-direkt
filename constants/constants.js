//The x and y constants for the pdf were inspected set from manual inspection with a pdf tool
const pdfConstants = {
    250: {
      x: 0,
      y: 110,
      width: 184,
      height: 152,
      maxWidth: 180
    },
    675: {
        x: 101,
        y: 200,
        width: 363,
        height: 263,
        maxWidth: 355
    },
    400: {
        x: 122,
        y: 130,
        width: 335,
        height: 194,
        maxWidth: 326
    },
    order: {
        width: 65,
        height: 13,
        centre: 10
    },
    print: {
        width: 55,
        height: 13,
        centre: 10
    },
    barcodeWidth: 184.2,
    barcodeHeight: 75.2,
    barcodeX: 100,
    barcodeY: 150,
    width: 700,
    height: 122,
    fontSize: 40,
    defaultText: 'Merci',
}

module.exports = {
    pdfConstants,
};