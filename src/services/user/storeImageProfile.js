/**
 * Module for storing and updating user profile images in Google Cloud Storage.
 * This module includes functions to register a default image for a user and update their profile image.
 * It also performs validation of file types for uploads.
 *
 * @module ProfileImageService
 */

const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const { getImageProfileForUpdate } = require('./getImageProfile');

// Instantiate Google Cloud Storage client
const storage = new Storage();

/**
 * Stores a default profile image for the user in the cloud storage.
 * This function uploads a default image to the user's profile location in the storage bucket.
 * The default image is copied from a predefined path and is given a specific name format.
 * 
 * @async
 * @function storeImageProfile
 * @param {string} userId - The unique identifier of the user whose default image is being stored.
 * @throws {Error} Throws an error if the image upload fails.
 */
async function storeImageProfile(userId) {
    try {
        // Construct paths for the default image and the user's changed image
        const defaultImage = `${process.env.BUCKET_DESTINATION_PROFILE}/${process.env.BUCKET_DEFAULT_IMAGE_PROFILE}`;
        const changedImage = `${process.env.BUCKET_DESTINATION_PROFILE}/${userId}-image.jpg`;

        // Log the image upload process
        console.log(`Uploading ${changedImage} to bucket ${process.env.BUCKET_NAME}`);

        // Copy the default image to the user's profile path in the bucket
        await storage
            .bucket(process.env.BUCKET_NAME)
            .file(defaultImage)
            .copy(storage.bucket(process.env.BUCKET_NAME).file(changedImage));

        // Log successful upload
        console.log(`${changedImage} has been uploaded to ${process.env.BUCKET_NAME}`);
    } catch (error) {
        // Log and throw error if image upload fails
        console.error('Error in store Image Profile:', error);
        throw error;
    }
}

/**
 * Updates the user's profile image in the cloud storage.
 * This function replaces the user's existing image with the new one provided in the request.
 * It performs file type validation and deletes the existing image before uploading the new one.
 * 
 * @async
 * @function updateImageProfile
 * @param {string} userId - The unique identifier of the user whose profile image is being updated.
 * @param {Stream} fileStream - The stream of the uploaded file.
 * @param {string} originalName - The original name of the uploaded file.
 * @throws {Error} Throws an error if the file format is invalid or the upload fails.
 */
async function updateImageProfile(userId, fileStream, originalName) {
    try {
        const bucket = storage.bucket(process.env.BUCKET_NAME);

        // Get the current image URL for the user
        const latestImage = await getImageProfileForUpdate(userId);

        // Delete the current image from the storage bucket
        await bucket.file(latestImage).delete();
        console.log(`File ${latestImage} has been deleted!`);

        // Validate the file extension (only allow .jpeg, .jpg, .png)
        const extension = path.extname(originalName).toLowerCase();
        if (extension !== '.jpeg' && extension !== '.jpg' && extension !== '.png') {
            throw new Error('Only JPEG and PNG formats are allowed.');
        }

        // Construct the new image file name
        const updatedImageProfile = `${userId}-image${extension}`;

        // Log the upload process
        console.log(`Uploading ${updatedImageProfile} to bucket ${process.env.BUCKET_NAME}`);

        // Define the destination path in the bucket
        const bucketDestination = `${process.env.BUCKET_DESTINATION_PROFILE}/${updatedImageProfile}`;
        const file = bucket.file(bucketDestination);

        // Create a write stream to upload the new image
        await new Promise((resolve, reject) => {
            const writeStream = file.createWriteStream({
                metadata: {
                    contentType: fileStream.hapi.headers['content-type'],
                },
                resumable: false,
            });

            // Pipe the file stream to the write stream and handle events
            fileStream.pipe(writeStream)
                .on('finish', resolve)
                .on('error', reject);
        });

        // Log successful upload (commented out to avoid cluttering logs)
        // console.log(`${updatedImageProfile} has been uploaded to ${process.env.BUCKET_NAME}/${bucketDestination}`);
    } catch (error) {
        // Log and handle errors during the image update process
        console.error('Error in update Image Profile:', error);
    }
}

// Export the functions for external use
module.exports = { storeImageProfile, updateImageProfile };
