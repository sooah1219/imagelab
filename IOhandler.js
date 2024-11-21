const fs = require("fs");
const PNG = require("pngjs").PNG;
const path = require("path");
const yauzl = require('yauzl-promise'),
  { pipeline } = require('stream/promises');

/**
 * Description: decompress file from given pathIn, write to given pathOut
*
* @param {string} zipFilePath
* @param {string} pathUnzipped
* @return {promise}
*/
const unzip = async (pathIn, pathOut) => {
  const zip = await yauzl.open(pathIn);
  try {
    fs.promises.mkdir(pathOut, { recursive: true });
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`);
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
          `${pathOut}/${entry.filename}`
        );
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
  }
};


/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  let pngFileGroup = [];
  const unzippedFile = await fs.promises.readdir(dir);
  unzippedFile.forEach(pngFile => {
    const checkPngFile = pngFile.endsWith("png");
    if (checkPngFile) {
      pngFileGroup.push(path.join(dir, pngFile));
    }
  });
  return pngFileGroup;
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

const grayScale = (pathIn, pathOut, filterType) => {
  fs.createReadStream(pathIn)
    .pipe(new PNG({ filterType: 4, }))
    .on("parsed", function () {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var idx = (this.width * y + x) << 2;

          const red = this.data[idx];
          const green = this.data[idx + 1];
          const blue = this.data[idx + 2];

          const chagnedValues = filter(red, green, blue, filterType);

          this.data[idx] = chagnedValues[0];
          this.data[idx + 1] = chagnedValues[1];
          this.data[idx + 2] = chagnedValues[2];
        }
      }
      this.pack().pipe(fs.createWriteStream(pathOut + `/${filterType}${parseInt(Math.random() * 5000)}.png`));
    });
};

function filter(red, green, blue, filterType) {
  let [r, g, b] = [];

  if (filterType === "gray") {
    const gray = (red + green + blue) / 3;
    [r, g, b] = [gray, gray, gray];
  } else if (filterType === "invert") {
    r = 255 - red;
    g = 255 - green;
    b = 255 - blue;
  } else if (filterType === "sepia") {
    r = Math.min(255, red * 0.393 + green * 0.769 + blue * 0.189);
    g = Math.min(255, red * 0.349 + green * 0.686 + blue * 0.168);
    b = Math.min(255, red * 0.272 + green * 0.534 + blue * 0.131);
  } else {
    throw error("error");
  }
  return [r, g, b];
}

module.exports = {
  unzip,
  readDir,
  grayScale,
};



