// Import the required libraries for Google Cloud Storage and file handling
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Initialize a Google Cloud Storage instance
const storage = new Storage();

/**
 * Uploads an image file to a Google Cloud Storage bucket.
 * This function validates the file format, generates a new file name based on the barcode ID,
 * and uploads the image to the specified bucket in Google Cloud Storage.
 * 
 * @param {string} barcodeId - The barcode ID to associate with the image.
 * @param {Object} fileStream - The file stream of the image to be uploaded.
 * @param {string} originalName - The original file name of the image.
 * @returns {Promise<string>} - A promise that resolves to the name of the uploaded file in the bucket.
 * @throws {Error} - Throws an error if the file format is invalid or there are issues during upload.
 */
async function storeImageProduct(barcodeId, fileStream, originalName) {
    try {
        // Validate the file extension (only jpeg, jpg, and png are allowed)
        const extension = path.extname(originalName).toLowerCase();
        if (extension !== '.jpeg' && extension !== '.jpg' && extension !== '.png') {
            throw new Error('Only JPEG and PNG formats are allowed.');
        }

        // Generate the new file name for storage based on the barcode ID
        const namaFile = `${barcodeId}-image${extension}`;

        console.log(`Uploading ${namaFile} to bucket ${process.env.BUCKET_NAME}`);

        // Define the destination path within the bucket
        const bucketDestination = `${process.env.BUCKET_DESTINATION_PRODUCT}/${namaFile}`;

        // Get a reference to the bucket and file
        const bucket = storage.bucket(process.env.BUCKET_NAME);
        const file = bucket.file(bucketDestination);

        // Upload the image file to the bucket
        await new Promise((resolve, reject) => {
            const writeStream = file.createWriteStream({
                metadata: {
                    contentType: fileStream.hapi.headers['content-type'],
                },
                resumable: false, // Disabling resumable uploads for simplicity
            });

            // Pipe the file stream to the write stream and handle success or failure
            fileStream.pipe(writeStream)
                .on('finish', resolve) // Resolve when the upload finishes successfully
                .on('error', reject);  // Reject if there is an error during the upload
        });

        console.log(`${namaFile} has been uploaded to ${process.env.BUCKET_NAME}/${bucketDestination}`);

        // Return the file name of the uploaded image
        return namaFile;
    } catch (error) {
        // Log and throw an error if there are issues with the file upload process
        console.error('Error in storeImage:', error);
        throw error;
    }
}

// Export the storeImageProduct function to be used in other parts of the application
module.exports = storeImageProduct;
