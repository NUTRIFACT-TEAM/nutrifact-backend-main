/**
 * Server configuration for Hapi.js application.
 * This file sets up a Hapi server with JWT authentication and Firestore database connection.
 * It also includes route registration and server startup.
 */

require('dotenv').config(); // Load environment variables from .env file
const Hapi = require('@hapi/hapi'); // Hapi.js framework for building APIs
const Jwt = require('@hapi/jwt'); // JWT authentication plugin for Hapi.js
const { Firestore } = require('@google-cloud/firestore'); // Google Cloud Firestore client
const db = new Firestore(); // Initialize Firestore instance
const routes = require('./routes'); // Import routes configuration
const { validateToken } = require('./config/token'); // Token validation logic

/**
 * Initialize and start the Hapi server.
 * This function configures the server, sets up authentication, registers routes, and starts the server.
 */
const init = async () => {
  // Create the Hapi server instance
  const server = Hapi.server({
    port: process.env.PORT || 3000, // Use environment variable PORT, default to 3000
    host: 'localhost', // Set server host to localhost
    routes: {
      cors: { origin: ['*'] }, // Enable CORS for all origins
    },
  });

  // Register JWT plugin for handling authentication
  await server.register(Jwt);

  // Configure JWT authentication
  const jwtConfig = {
    keys: process.env.JWT_SECRET, // Secret key used to sign JWT
    verify: {
      aud: process.env.JWT_AUDIENCE, // Audience of the token (application identifier)
      iss: process.env.JWT_ISSUER, // Issuer of the token
      sub: false, // Do not check for subject
    },
    validate: validateToken, // Function to validate JWT on each request
  };

  // Set up JWT authentication strategy
  server.auth.strategy('jwt', 'jwt', jwtConfig);

  // Register routes defined in the routes file
  server.route(routes);

  // Test Firestore connection
  try {
    console.log('Firestore connected successfully!');
  } catch (error) {
    console.error('Firestore connection failed:', error.message);
    process.exit(1); // Exit the process if Firestore connection fails
  }

  // Start the Hapi server
  await server.start();
  console.log(`Server running on ${server.info.uri}`); // Log server URL
};

// Handle unhandled promise rejections (e.g., database connection errors, unhandled routes, etc.)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1); // Exit the process if an unhandled rejection occurs
});

// Initialize the server
init();
