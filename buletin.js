let format = 'a5';      // Can be 'a5', 'a6', 'A5' or 'A6'
let pages = 20;         // Must be multiple of four like 4,8,12,16,20,24,....

function getPagesToPrint(pageFormat = 'a6', pagesCount = 20) {
    pageFormat = pageFormat.toLowerCase();

    if (!['a5', 'a6'].includes(pageFormat)) {
        console.error("Format must be 'a5', 'a6', 'A5' or 'A6' but '" + pageFormat + "' found");
        return;
    }

    if (pagesCount % 4 !== 0) {
        console.error("Pages count must be multiple of four (like 4, 8, 12, 16, 20, 24, ...) but " + pagesCount + " found");
        return;
    }

    const pagesPerSheet = pageFormat === 'a5' ? 2 : 4;
    const frontFaceNumbers = [];
    const reverseFaceNumbers = [];

    let maxPage = pagesCount;
    let minPage = 1;

    for (let i = 0 ; i < pagesCount/4 ; i++) {
        frontFaceNumbers.push(maxPage--);
        frontFaceNumbers.push(minPage++);

        reverseFaceNumbers.push(minPage++);
        reverseFaceNumbers.push(maxPage--);
    }

    console.log('Front face - ', frontFaceNumbers.join());
    console.log('Reverse face - ', reverseFaceNumbers.join());
    console.log('pages per sheet - ', pagesPerSheet);
    console.log('One side print');
}

getPagesToPrint(format, pages);
