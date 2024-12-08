// Import Firestore from @google-cloud/firestore to interact with the Firestore database
const { Firestore } = require('@google-cloud/firestore'); // Firestore to interact with user data
// Import bcrypt for password hashing
const bcrypt = require('bcrypt'); // bcrypt to hash and secure the user's password
// Import updateImageProfile function to handle updating the user's profile image
const { updateImageProfile } = require('../../services/user/storeImageProfile'); // Function to update user's profile image

/**
 * Handler function to update a user's profile.
 * 
 * This function updates a user's profile information based on the fields provided in the request payload.
 * The user can update their name, password, and/or profile image.
 * 
 * @param {Object} request - The Hapi.js request object containing the user's updated profile data (name, password, image).
 * @param {Object} h - The Hapi.js response toolkit used to send the response.
 * @returns {Object} - Returns a response object with status and a message indicating the result of the operation.
 */
const updateProfileHandler = async (request, h) => {
  // Destructure the fields (name, password, image) from the request payload
  const { name, password, image } = request.payload;
  
  // Get the user ID from the authenticated user's credentials
  const userId = request.auth.credentials.user.id;
  
  // Create a new Firestore instance to interact with the Firestore database
  const db = new Firestore();
  
  // Access the 'users' collection in Firestore
  const usersCollection = db.collection('users');

  // If no field is provided (name, password, or image), return a 400 Bad Request response
  if (!name && !password && !image) {
    return h.response({
      status: 400,
      message: 'At least one field (name or password or image) is required', // Error message indicating that at least one field is required
    }).code(400);
  }

  try {
    // Attempt to fetch the user's document by userId
    const userDoc = await usersCollection.doc(userId).get();

    // If the user's document does not exist, return a 404 Not Found response
    if (!userDoc.exists) {
      return h.response({
        status: 404,
        message: 'User not found', // Error message indicating the user does not exist
      }).code(404);
    }

    // Create an object to hold the fields to be updated
    let updateData = {};
    
    // If a new name is provided, update the name field
    if (name) {
      updateData.name = name;
      await usersCollection.doc(userId).update(updateData);
    }
    
    // If a new password is provided, hash it and update the password field
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10); // Hash the new password before updating
      await usersCollection.doc(userId).update(updateData);
    }
    
    // If a new profile image is provided, update the image
    if (image) {
      // Call updateImageProfile function to update the user's profile image
      await updateImageProfile(userId, image, image.hapi.filename);
      // Optionally, updateData.image = data; if the image data needs to be stored in Firestore
    }

    // Return a success response with status 200 (OK)
    return h.response({
      status: 200, // Status code 200 indicates that the profile was updated successfully
      message: 'Profile updated successfully', // Success message
    }).code(200);

  } catch (error) {
    // If an error occurs, log it and return a 500 Internal Server Error response
    console.error(error); // Log the error for debugging
    return h.response({
      status: 500,
      message: 'Server error', // Error message indicating a server-side issue
    }).code(500);
  }
};

// Export the updateProfileHandler function to be used elsewhere in the application
module.exports = updateProfileHandler;
