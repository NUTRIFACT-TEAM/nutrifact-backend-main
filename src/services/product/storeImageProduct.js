const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

const storage = new Storage();

async function storeImageProduct(barcodeId, fileStream, originalName) {
    try {

        const storage = new Storage();
        const extension = path.extname(originalName).toLowerCase();

        if (extension !== '.jpeg' && extension !== '.jpg' && extension !== '.png') {
            throw new Error('Hanya format JPEG dan PNG yang diizinkan.');
        }

        const namaFile = `${barcodeId}-image${extension}`;

        console.log(`Uploading ${namaFile} to bucket ${process.env.BUCKET_NAME}`);

        const bucketDestination = `imageProduct/${namaFile}`;
        const bucket = storage.bucket(process.env.BUCKET_NAME);
        const file = bucket.file(bucketDestination);

        await new Promise((resolve, reject) => {
            const writeStream = file.createWriteStream({
                metadata: {
                    contentType: fileStream.hapi.headers['content-type'],
                },
                resumable: false,
            });

            fileStream.pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        console.log(`${namaFile} telah diunggah ke ${process.env.BUCKET_NAME}/${bucketDestination}`);

        return namaFile;
    } catch (error) {
        console.error('Error in storeImage:', error);
        throw error;
    }
}

module.exports = storeImageProduct;
