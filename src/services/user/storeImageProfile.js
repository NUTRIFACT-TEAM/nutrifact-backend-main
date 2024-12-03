const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const { getImageProfileForUpdate } = require('./getImageProfile');

const storage = new Storage();

// Ini untuk register
async function storeImageProfile(userId) {
    try {

        const storage = new Storage();

        const defaultImage = `${process.env.BUCKET_DESTINATION_PROFILE}/${process.env.BUCKET_DEFAULT_IMAGE_PROFILE}`;

        const changedImage = `${process.env.BUCKET_DESTINATION_PROFILE}/${userId}-image.jpg`;

        console.log(`Uploading ${changedImage} to bucket ${process.env.BUCKET_NAME}`);
        storage
            .bucket(process.env.BUCKET_NAME)
            .file(defaultImage)
            .copy(storage.bucket(process.env.BUCKET_NAME).file(changedImage))        

        console.log(`${changedImage} has been uploaded to ${process.env.BUCKET_NAME}`);
    } catch (error) {
        console.error('Error in store Image Profile:', error);
        throw error;
    }
}

// ini untuk updateProfile 
async function updateImageProfile(userId, fileStream, originalName) {
    try {
        
        const bucket = storage.bucket(process.env.BUCKET_NAME);

        const latestImage = await getImageProfileForUpdate(userId);

        await bucket.file(latestImage).delete();
        console.log(`File ${latestImage} has been deleted!`);

        
        const extension = path.extname(originalName).toLowerCase();

        if (extension !== '.jpeg' && extension !== '.jpg' && extension !== '.png') {
            throw new Error('Hanya format JPEG dan PNG yang diizinkan.');
        }

        const updatedImageProfile = `${userId}-image${extension}`;

        console.log(`Uploading ${updatedImageProfile} to bucket ${process.env.BUCKET_NAME}`);

        const bucketDestination = `${process.env.BUCKET_DESTINATION_PROFILE}/${updatedImageProfile}`;
        // // const bucket = storage.bucket(process.env.BUCKET_NAME);
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

        // console.log(`${updatedImageProfile} has been uploaded to ${process.env.BUCKET_NAME}/${bucketDestination}`);
    } catch (error) {
        console.error(`Error in update Image Profile:`, error)
    }
}

module.exports = {storeImageProfile, updateImageProfile};
