const loginHandler = require('./handler/auth/login');
const registerHandler = require('./handler/auth/register');
const getProfileHandler = require('./handler/auth/getProfile');

const routes = [
//   {
//     path: '/products',
//     method: 'POST',
//     handler: postNewProductHandler,
//     options: {
//       payload: {
//         parse: true,
//         multipart: true,
//         // output: 'data',
//         allow: 'multipart/form-data'
//       }
//     },
//   },
//   {
//     path: '/products/{barcodeId}',
//     method: 'GET',
//     handler: getProductbyScanHandler
//   },
//   {
//     method: "GET",
//     path: "/",
//     handler: () => ({
//       message: "API is up and running!",
//     }),
//   },

//   {
//     method: "GET",
//     path: "/test-auth",
//     handler: (request, h) => ({
//       message: "Test route is working without JWT!",
//     }),
//   },

  {
    method: 'POST',
    path: '/login',
    handler: loginHandler,
  },
  {
    method: 'POST',
    path: '/register',
    handler: registerHandler,
  },
  {
    method: 'GET',
    path: '/profile/{userId}',
    handler: getProfileHandler,
  },
];

module.exports = routes;