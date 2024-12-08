/**
 * Routes configuration for the application.
 * This file defines the routes for product management, user authentication, profile handling, and award redemption.
 * Each route is associated with a handler function, HTTP method, and, where necessary, authentication and payload configurations.
 *
 * @module Routes
 */

const { postNewProductHandler, getProductbyScanHandler } = require('./handler/product/handler');
const { getAllAwardsHandler, redeemAwardHandler, getRedeemHistoryHandler } = require('./handler/award/handlerAward');
const loginHandler = require('./handler/auth/login');
const registerHandler = require('./handler/auth/register');
const getProfileHandler = require('./handler/auth/getProfile');
const updateProfileHandler = require('./handler/auth/update');

// Define the application routes
const routes = [
  // Tambahkan route ini di bagian atas atau bawah array `routes`
  {
    /**
     * Route untuk menampilkan pesan "Nutrifact-backend-main is running!".
     * @method GET
     * @path /
     * @handler handler untuk menampilkan pesan
     */
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'Nutrifact-backend-main is running!';
    },
  },
  // Routes for product management
  {
    /**
     * Route for adding a new product to the database.
     * @method POST
     * @path /products
     * @handler postNewProductHandler
     * @options {Object} Configuration options for this route.
     * - auth: 'jwt' ensures that the user is authenticated with a JWT.
     * - payload configuration allows 'multipart/form-data' for file uploads, limits the payload size, and outputs the payload as a stream.
     */
    path: '/products',
    method: 'POST',
    handler: postNewProductHandler,
    options: {
      auth: 'jwt',
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        parse: true,
        maxBytes: 10000000, // Maximum file size of 10MB
        multipart: {
          output: 'stream'
        }
      },
    },
  },

  {
    /**
     * Route to retrieve product details by scanning the barcode.
     * @method GET
     * @path /products/{barcodeId}
     * @handler getProductbyScanHandler
     */
    path: '/products/{barcodeId}',
    method: 'GET',
    handler: getProductbyScanHandler
  },

  // Routes for user authentication and profile handling
  {
    /**
     * Route for user login.
     * @method POST
     * @path /login
     * @handler loginHandler
     */
    method: 'POST',
    path: '/login',
    handler: loginHandler,
  },

  {
    /**
     * Route for user registration.
     * @method POST
     * @path /register
     * @handler registerHandler
     */
    method: 'POST',
    path: '/register',
    handler: registerHandler,
  },

  {
    /**
     * Route to retrieve the user's profile details.
     * @method GET
     * @path /profile
     * @handler getProfileHandler
     * @options {Object} Configuration options for this route.
     * - auth: 'jwt' ensures that the user is authenticated with a JWT.
     */
    method: 'GET',
    path: '/profile',
    handler: getProfileHandler,
    options: {
      auth: 'jwt',
    }
  },

  {
    /**
     * Route to update the user's profile information.
     * @method PUT
     * @path /profile
     * @handler updateProfileHandler
     * @options {Object} Configuration options for this route.
     * - auth: 'jwt' ensures that the user is authenticated with a JWT.
     * - payload configuration allows 'multipart/form-data' for file uploads, limits the payload size, and outputs the payload as a stream.
     */
    method: 'PUT',
    path: '/profile',
    handler: updateProfileHandler,
    options: {
      auth: 'jwt',
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        parse: true,
        maxBytes: 10000000, // Maximum file size of 10MB
        multipart: {
          output: 'stream'
        }
      },
    }
  },

  // Routes for award management
  {
    /**
     * Route to retrieve all available awards.
     * @method GET
     * @path /awards
     * @handler getAllAwardsHandler
     * @options {Object} Configuration options for this route.
     * - auth: 'jwt' ensures that the user is authenticated with a JWT.
     */
    method: 'GET',
    path: '/awards',
    handler: getAllAwardsHandler,
    options: { auth: 'jwt' },
  },

  {
    /**
     * Route to redeem an award.
     * @method POST
     * @path /awards/redeem
     * @handler redeemAwardHandler
     * @options {Object} Configuration options for this route.
     * - auth: 'jwt' ensures that the user is authenticated with a JWT.
     */
    method: 'POST',
    path: '/awards/redeem',
    handler: redeemAwardHandler,
    options: { auth: 'jwt' },
  },

  {
    /**
     * Route to retrieve the user's award redemption history.
     * @method GET
     * @path /redeem-history
     * @handler getRedeemHistoryHandler
     * @options {Object} Configuration options for this route.
     * - auth: 'jwt' ensures that the user is authenticated with a JWT.
     */
    method: 'GET',
    path: '/redeem-history',
    handler: getRedeemHistoryHandler,
    options: { auth: 'jwt' },
  },
];

module.exports = routes;
