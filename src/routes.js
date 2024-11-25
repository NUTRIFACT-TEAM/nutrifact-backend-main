const { postNewProductHandler, getProductbyScanHandler } = require('./handler/product/handler');

const loginHandler = require('./handler/auth/login');
const registerHandler = require('./handler/auth/register');
const getProfileHandler = require('./handler/auth/getProfile');
const updateProfileHandler = require('./handler/auth/update');

const routes = [
  {
    path: '/products',
    method: 'POST',
    handler: postNewProductHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        parse: true,
        maxBytes: 10000000,
        multipart: {
          output: 'stream'
        }
      },
    },
  },
  {
    path: '/products/{barcodeId}',
    method: 'GET',
    handler: getProductbyScanHandler
  },
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
    path: '/profile',
    handler: getProfileHandler,
    options: {
      auth: 'jwt',
    }
  },
  {
    method: 'PUT',
    path: '/profile',
    handler: updateProfileHandler,
    options: {
      auth: 'jwt',
    }
  }
];

module.exports = routes;