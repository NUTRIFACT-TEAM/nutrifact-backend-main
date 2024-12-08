// Import Firestore from @google-cloud/firestore to interact with the Firestore database
const { Firestore } = require('@google-cloud/firestore'); // Firestore for managing user data
// Import nanoid to generate unique user IDs
const { nanoid } = require('nanoid'); // nanoid to generate unique user ID
// Import bcrypt for password hashing
const bcrypt = require('bcrypt'); // bcrypt for securely hashing passwords
// Import storeImageProfile to handle storing the user's profile image
const { storeImageProfile } = require('../../services/user/storeImageProfile'); // Function to store user's profile image

/**
 * Handler function to register a new user.
 * 
 * This function accepts user data (name, email, password) from the request payload, 
 * checks if the email already exists in the Firestore database, and if not, 
 * creates a new user with a hashed password, generates a unique user ID, 
 * and stores the user's profile image.
 * 
 * @param {Object} request - The Hapi.js request object containing the user data (name, email, password).
 * @param {Object} h - The Hapi.js response toolkit used to send the response.
 * @returns {Object} - Returns a response object with status and user data if successful, or an error message if something goes wrong.
 */
const registerHandler = async (request, h) => {
  // Destructure the name, email, and password from the request payload
  const { name, email, password } = request.payload;
  
  // Create a new Firestore instance to interact with the Firestore database
  const db = new Firestore();
  
  // Access the 'users' collection in Firestore
  const usersCollection = db.collection('users');

  try {
    // Check if the email already exists in the Firestore database
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    
    // If the email already exists, return a 400 Bad Request response
    if (!userSnapshot.empty) {
      return h.response({
        status: 400,
        message: 'Email already exists', // Message indicating the email is already in use
      }).code(400);
    }

    // Hash the user's password using bcrypt
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    // Generate a unique user ID using nanoid
    const id = `user-${nanoid(16)}`;

    // Store the new user in the Firestore database with the generated ID and hashed password
    await usersCollection.doc(id).set({
      id, // Unique user ID
      name, // User's name
      email, // User's email
      password: hashedPassword, // User's hashed password
      points: 0, // Initialize points to 0
      createdAt: new Date().toISOString(), // Store the user's registration date
    });

    // Store the user's profile image (assumed to be handled by another service)
    await storeImageProfile(id);

    // Return a success response with status 201 (Created) and the new user data
    return h.response({
      status: 201, // HTTP status 201 means resource created successfully
      message: 'User registered successfully', // Success message
      data: {
        id, // User's unique ID
        name, // User's name
        email, // User's email
      },
    }).code(201);

  } catch (error) {
    // Handle any errors during the user registration process
    console.error(error); // Log the error for debugging
    // Return a 500 Internal Server Error response in case of failure
    return h.response({
      status: 500,
      message: 'Server error', // Generic server error message
    }).code(500);
  }
};

// Export the registerHandler function to be used elsewhere in the application
module.exports = registerHandler;
