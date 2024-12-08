// Import Firestore from @google-cloud/firestore to interact with Firestore database
const { Firestore } = require('@google-cloud/firestore'); // Firestore to access user data
// Import the getImageProfile function from the module that handles fetching the user profile image URL
const { getImageProfile } = require('../../services/user/getImageProfile'); // Function to get user profile image URL

/**
 * Handler function to fetch the user profile based on the request.
 * 
 * This function retrieves the userId from the authentication credentials in the request, 
 * looks up the user's document in the Firestore database, and fetches the user's profile image 
 * URL using the getImageProfile function.
 * 
 * @param {Object} request - The Hapi.js request object containing the user's authentication credentials.
 * @param {Object} h - The Hapi.js response toolkit used to send the response.
 * @returns {Object} - Returns a response object with status and user profile data if successful, or an error message if there's an issue.
 */
const getProfileHandler = async (request, h) => {
  // Retrieve the userId from the authentication credentials in the request
  const userId = request.auth.credentials.user.id;
  
  // Create a new Firestore instance to access the database
  const db = new Firestore();
  
  // Access the 'users' collection in Firestore
  const usersCollection = db.collection('users');

  try {
    // Attempt to retrieve the user's document by userId
    const userDoc = await usersCollection.doc(userId).get();

    // If the user's document does not exist, return a 404 Not Found response
    if (!userDoc.exists) {
      return h.response({
        status: 404,
        message: 'User not found',
      }).code(404);
    }

    // Store the user data retrieved from Firestore
    const userData = userDoc.data();

    // Fetch the user's profile image URL by calling getImageProfile function
    const profileImageURL = await getImageProfile(userId);

    // Return a successful response with the user profile data
    return h.response({
      status: 200, // Status code 200 indicates that the request was processed successfully
      message: 'User profile fetched successfully', // Message explaining the success of fetching the profile
      data: {
        id: userData.id, // User's ID
        name: userData.name, // User's name
        email: userData.email, // User's email
        profileImageURL, // URL of the user's profile image
        points: userData.points, // User's points
      },
    }).code(200); // Return status code 200 (OK)

  } catch (error) {
    // Handle any errors during the process of fetching user data
    console.error(error); // Log the error to the console for debugging
    // Return a 500 Server Error response if an internal server error occurs
    return h.response({
      status: 500,
      message: 'Server error',
    }).code(500);
  }
};

// Export getProfileHandler to be used in other parts of the application
module.exports = getProfileHandler;
