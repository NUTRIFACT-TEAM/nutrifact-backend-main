/**
 * This module handles JSON Web Token (JWT) generation and validation.
 * It uses the @hapi/jwt plugin to generate and validate JWT tokens in a Hapi.js application.
 * The module reads environment variables from the .env file for sensitive configuration values.
 */

require('dotenv').config({ path: __dirname + '/../../.env' }); // Load environment variables from .env file
const Jwt = require('@hapi/jwt'); // Import @hapi/jwt plugin for handling JWTs

// Destructure environment variables for JWT configuration
const {
  JWT_SECRET,      // Secret key used to sign the JWT
  JWT_AUDIENCE,    // Expected audience for the JWT
  JWT_ISSUER,      // Issuer of the JWT
  JWT_ALGORITHM,   // Algorithm used to sign the JWT (e.g., 'HS256')
} = process.env;

/**
 * Generates a new JWT for a given user.
 * The token contains the user's ID and other relevant information.
 * 
 * @param {Object} user - The user object containing user information.
 * @returns {string} - The generated JWT token.
 */
const generateToken = (user) => {
  // Create a JWT token with the specified claims and signing options
  const token = Jwt.token.generate(
    {
      aud: JWT_AUDIENCE,         // Audience (application or service receiving the token)
      iss: JWT_ISSUER,           // Issuer (usually the application or service that generated the token)
      sub: user.id,              // Subject (the user ID for whom the token is issued)
      user: user,                // Payload containing the user object
    },
    {
      key: JWT_SECRET,           // Secret key for signing the JWT
      algorithm: JWT_ALGORITHM,  // Signing algorithm (e.g., 'HS256')
    },
    {
      ttlSec: 14400,             // Time-to-live (TTL) for the token in seconds (4 hours)
    }
  );

  return token;
};

/**
 * Validates the JWT token provided in the request.
 * This function ensures the token is valid and checks if the required payload fields are correct.
 * 
 * @param {Object} artifacts - Contains the decoded token payload after verification.
 * @param {Object} request - The Hapi.js request object.
 * @param {Object} h - The Hapi.js response toolkit.
 * @returns {Object} - An object indicating if the token is valid and the associated user credentials.
 */
const validateToken = (artifacts, request, h) => {
  // Validate the 'aud' (audience) claim of the token
  const isValid = artifacts.decoded.payload.aud === JWT_AUDIENCE;

  // Check if the 'sub' (subject) field exists and is valid (non-empty)
  const sub = artifacts.decoded.payload.sub;
  const isSubValid = !!sub;

  if (!isSubValid) {
    console.log('Token sub value is missing or invalid');
    return { isValid: false };  // Return invalid if the 'sub' value is invalid
  }

  return {
    isValid,  // Return if the token is valid based on audience check
    credentials: { user: artifacts.decoded.payload.user },  // Attach user info from the token
  };
};

// Export the functions to be used elsewhere in the application
module.exports = { generateToken, validateToken };
