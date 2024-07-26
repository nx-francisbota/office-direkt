/**
 * The x and y constants for the pdf were inspected set from manual inspection with a pdf tool
 * The keys 250, 400 & 675 represent the gram categorization of the product wraps
 * The value object's values are all in mm (which are converted to 1/12 inches
 */
module.exports.pdfConstants = {
    250: {
        x: 0,
        y: 110,
        width: 184,
        height: 152,
        maxWidth: 180,
        aspectRatio: 1.2105
    },
    675: {
        x: 101,
        y: 200,
        width: 363,
        height: 263,
        maxWidth: 355,
        aspectRatio: 1.3802
    },
    400: {
        x: 122,
        y: 130,
        width: 335,
        height: 194,
        maxWidth: 326,
        aspectRatio: 1.7268
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
    scale: 0.19798994974874373,
    titleScale: 0.7174718060932502,
    basicFontSize: 95.477386,
    pixelToPointRatio: 0.74999943307122,
    standardDPI: 96
}

/**
 *  
 */
module.exports.newPDFValues = {
    250: {
        xPx: 280,
        yPx: 948,
        widthPx: 2145,
        heightPx: 1781,
        widthMm: 183,
        heightMm: 152,
    },
    400: {
        xPx: 406.5,
        yPx: 942.5,
        widthPx: 3081,
        heightPx: 1781,
        widthMm: 332,
        heightMm: 192,
    },
    675: {
        xPx: 282,
        yPx: 954,
        widthPx: 2408,
        heightPx: 1826,
        widthMm: 365,
        heightMm: 270,
    },
}


/**
 * This is a map of title text character length vs percentage downscale
 *     1: 95.477386,
 *     2: 95.477386,
 *     3: 95.477386,
 *     4: 95.477386,
 *     5: 84.112007,
 *     6: 70.520142,
 *     7: 61.831825,
 *     8: 60.587723,
 *     9: 53.201588,
 *     10: 47.123787,
 *     11: 44.087994,
 *     12: 39.989506,
 *     13: 36.632725,
 *     14: 33.495106,
 *     15: 31.10754,
*/
module.exports.fontSizeProportionDownscale = {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 0.8809626,
    6: 0.7386057,
    7: 0.6476070,
    8: 0.6345767,
    9: 0.5572166,
    10: 0.4935596,
    11: 0.4617637,
    12: 0.4188374,
    13: 0.3836795,
    14: 0.3508171,
    15: 0.3258105,
}

module.exports.svgAdjustmentFactors = {
    1: 1.1,
    2: 1.2,
}