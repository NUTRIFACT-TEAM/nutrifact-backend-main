/**
 * Module for retrieving user profile images from a Google Cloud Storage bucket.
 * This module provides functions to fetch a user's profile image in different formats,
 * and checks if the file exists in the cloud storage.
 *
 * @module ProfileImageService
 */

const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');

// Instantiate Google Cloud Storage client
const storage = new Storage();

// Allowed image formats to search for (jpg, jpeg, png)
const allowedImageFormats = ['jpg', 'jpeg', 'png'];

/**
 * Retrieves the URL of the user's profile image from the cloud storage.
 * It checks for the user's image in multiple formats and returns the URL of the first found image.
 * 
 * @async
 * @function getImageProfile
 * @param {string} userId - The unique identifier of the user whose profile image is being requested.
 * @returns {string} The URL of the profile image.
 * @throws {Error} Throws an error if no profile image is found in any of the allowed formats.
 */
async function getImageProfile(userId) {
    // Iterate through each allowed image format to search for the profile image
    for (const format of allowedImageFormats) {
        // Construct the URL for the profile image in the current format
        const imageProfileURL = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${process.env.BUCKET_DESTINATION_PROFILE}/${userId}-image.${format}`;

        // Check if the file exists in the cloud storage
        const fileExists = await checkFileExists(userId, format);
        if (fileExists) {
            // Log and return the image URL if the file exists
            console.log(imageProfileURL);
            return imageProfileURL;
        }
    }

    // Throw an error if no profile image is found in any of the allowed formats
    throw new Error(`Profile Picture for '${userId}' not found in allowed formats.`);
}

/**
 * Retrieves the URL of the user's profile image for update purposes.
 * This function follows a similar approach to `getImageProfile`, but it assumes a simpler destination path for the image.
 *
 * @async
 * @function getImageProfileForUpdate
 * @param {string} userId - The unique identifier of the user whose profile image is being requested.
 * @returns {string} The URL of the profile image.
 * @throws {Error} Throws an error if no profile image is found in any of the allowed formats.
 */
async function getImageProfileForUpdate(userId) {
    // Iterate through each allowed image format to search for the profile image
    for (const format of allowedImageFormats) {
        // Construct the URL for the profile image in the current format
        const imageProfileURL = `${process.env.BUCKET_DESTINATION_PROFILE}/${userId}-image.${format}`;

        // Check if the file exists in the cloud storage
        const fileExists = await checkFileExists(userId, format);
        if (fileExists) {
            // Log and return the image URL if the file exists
            console.log(imageProfileURL);
            return imageProfileURL;
        }
    }

    // Throw an error if no profile image is found in any of the allowed formats
    throw new Error(`Profile Picture for '${userId}' not found in allowed formats.`);
}

/**
 * Checks whether a specific file exists in the cloud storage bucket.
 * 
 * @async
 * @function checkFileExists
 * @param {string} userId - The unique identifier of the user whose profile image is being checked.
 * @param {string} format - The file format of the image (e.g., 'jpg', 'png').
 * @returns {boolean} `true` if the file exists, otherwise `false`.
 */
async function checkFileExists(userId, format) {
    // Construct the file name and its path within the cloud storage bucket
    const fileName = `${userId}-image.${format}`;
    const file = storage.bucket(process.env.BUCKET_NAME).file(`${process.env.BUCKET_DESTINATION_PROFILE}/${fileName}`);
    
    // Check if the file exists in the specified location
    const [exists] = await file.exists();
    return exists;
}

// Export the functions for external usage
module.exports = { getImageProfile, getImageProfileForUpdate };
