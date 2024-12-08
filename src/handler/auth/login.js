// Import required modules
const { Firestore } = require('@google-cloud/firestore'); // Firestore library to interact with Google Cloud Firestore
const bcrypt = require('bcrypt'); // Bcrypt library for password hashing and comparison
const { generateToken } = require('../../config/token'); // Custom module to generate JWT tokens

/**
 * Handles user login requests.
 * 
 * This function receives a request containing the user's email and password, 
 * checks if the user exists in the Firestore database, verifies the password, 
 * and returns a JWT token if the login is successful.
 * 
 * @param {Object} request - The Hapi.js request object.
 * @param {Object} h - The Hapi.js response toolkit.
 * @returns {Object} - Returns a response object with status and message, and user data if successful.
 */
const loginHandler = async (request, h) => {
  // Destructure the email and password from the request payload
  const { email, password } = request.payload;

  // Initialize Firestore database and reference to the 'users' collection
  const db = new Firestore();
  const usersCollection = db.collection('users');

  try {
    // Query the 'users' collection to find a document with the provided email
    const userSnapshot = await usersCollection.where('email', '==', email).get();

    // If no user is found, return a 401 Unauthorized response
    if (userSnapshot.empty) {
      return h.response({
        status: 401,
        message: 'User not found',
      }).code(401);
    }

    // Retrieve the first document from the snapshot (since 'email' should be unique)
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Compare the provided password with the hashed password stored in the database
    const isValid = await bcrypt.compare(password, userData.password);

    // If the password does not match, return a 401 Unauthorized response
    if (!isValid) {
      return h.response({
        status: 401,
        message: 'Wrong password',
      }).code(401);
    }

    // If the password is correct, generate a JWT token using the user data
    const token = generateToken(userData);

    // Return a successful response with the JWT token and user information
    return h.response({
      status: 200,
      message: 'Login successful',
      data: {
        token, // The generated JWT token
        user: { // The user information
          id: userData.id,
          name: userData.name,
          email: userData.email,
        },
      },
    }).code(200);

  } catch (error) {
    // Log any errors and return a generic 401 Unauthorized response
    console.error(error);
    return h.response({
      status: 401,
      message: 'Invalid credentials',
    }).code(401);
  }
};

// Export the login handler for use in other modules
module.exports = loginHandler;
