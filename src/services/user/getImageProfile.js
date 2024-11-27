const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

const storage = new Storage();

const allowedImageFormats = ['jpg', 'jpeg', 'png'];

async function getImageProfile(userId) {
    for (const format of allowedImageFormats) {
        const imageProfileURL = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${process.env.BUCKET_DESTINATION_PROFILE}/${userId}-image.${format}`;

        const fileExists = await checkFileExists(userId, format);
        if (fileExists) {
            console.log(imageProfileURL);
            return imageProfileURL; 
        }
    }

    throw new Error(`Profile Picture for '${userId}' not found in allowed formats.`);
}

async function getImageProfileForUpdate(userId) {
    for (const format of allowedImageFormats) {
        const imageProfileURL = `${process.env.BUCKET_DESTINATION_PROFILE}/${userId}-image.${format}`;

        const fileExists = await checkFileExists(userId, format);
        if (fileExists) {
            console.log(imageProfileURL);
            return imageProfileURL; 
        }
    }

    throw new Error(`Profile Picture for '${userId}' not found in allowed formats.`);

}

async function checkFileExists(userId, format) {
    const fileName = `${userId}-image.${format}`;
    const file = storage.bucket(process.env.BUCKET_NAME).file(`${process.env.BUCKET_DESTINATION_PROFILE}/${fileName}`);
    const [exists] = await file.exists();
    return exists;
}


module.exports = {getImageProfile, getImageProfileForUpdate};