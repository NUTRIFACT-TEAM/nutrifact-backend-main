const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

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
async function updateImageProfile(userId) {
    try {
        
    } catch (error) {
        console.error(`Error in update Image Profile:`, error)
    }
}

module.exports = {storeImageProfile, updateImageProfile};
