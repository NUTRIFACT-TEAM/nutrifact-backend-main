const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage();

async function storeImageAward(awardId, fileStream, originalName) {
  const extension = path.extname(originalName).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(extension)) {
    throw new Error('Only JPG and PNG formats are allowed');
  }

  const fileName = `${awardId}-image${extension}`;
  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const file = bucket.file(`${process.env.BUCKET_DESTINATION_AWARD}/${fileName}`);

  await new Promise((resolve, reject) => {
    const writeStream = file.createWriteStream({
      metadata: { contentType: fileStream.hapi.headers['content-type'] },
      resumable: false,
    });
    fileStream.pipe(writeStream).on('finish', resolve).on('error', reject);
  });

  return fileName;
}

module.exports = storeImageAward;
