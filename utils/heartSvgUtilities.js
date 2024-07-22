/**
 * Counts and identifies the last i in the text and returns
 * an object of the number of Is, textLength and the index of the last I
 * @param { string } text - The title text from the accompanying JSON
 * @return {{count: number, textLength: *, lastIndex: number}}
 */
const countAndFindLastI = (text) => {
    const lowerText = text.toLowerCase();
    const textLength = text.length

    let count = 0;
    let lastIndex = -1;

    for (let i = 0; i < lowerText.length; i++) {
        if (lowerText[i] === "i") {
            count++;
            lastIndex = i;
        }
    }

    return {
        count,
        textLength,
        lastIndex,
    };
}


/**
 * Replace the last i in the title text with the Latin-script alphabet "ı" to resolve the peeking dot issue at print
 * @param { string } text - The title text from the accompanying JSON
 * @return { string }
 */
const makeLastIDotless = (text) => {
    const splitTxt = text.split("i")
    if (splitTxt.length === 1) return splitTxt[0];

    const splits = splitTxt.length
    for (let i = 0; i < splits - 1; i++) {
        switch (i) {
            case splits - 2:
                splitTxt[i] = splitTxt[i] + "ı"
                break;
            default:
                splitTxt[i] = splitTxt[i] + "i"
                break;
        }
    }
    return splitTxt.join('')
}

/**
 *
 * @param text
 * @return {unknown[]}
 */
const splitToLastI = (text) => {
    const splitTxt = text.split('i');
    const restoredCharacterSplits =  splitTxt.map((t, i) => {
        if (i !== splitTxt.length - 1) {
            return t + "i";
        }
    });
    restoredCharacterSplits.pop()
    return restoredCharacterSplits
}

module.exports = {
    countAndFindLastI,
    splitToLastI,
    makeLastIDotless,
}