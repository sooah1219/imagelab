const path = require("path");

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

async function main() {
    try {
        // await IOhandler.unzip(zipFilePath, pathUnzipped);
        // console.log("Extraction operation complete.");
        const pngFiles = await IOhandler.readDir(pathUnzipped);
        pngFiles.forEach(pngFile => {
            IOhandler.grayScale(pngFile, pathProcessed, "gray");
        });
    } catch (err) {
        console.log(err);
    }
}

main();
