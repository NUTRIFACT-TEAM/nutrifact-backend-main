const { postNewProductHandler, getProductbyScanHandler } = require('./handler/product/handler');
const { getAllAwardsHandler, redeemAwardHandler, getRedeemHistoryHandler } = require('./handler/award/handlerAward');
const loginHandler = require('./handler/auth/login');
const registerHandler = require('./handler/auth/register');
const getProfileHandler = require('./handler/auth/getProfile');
const updateProfileHandler = require('./handler/auth/update');

const routes = [

  // Routes products
  {
    path: '/products',
    method: 'POST',
    handler: postNewProductHandler,
    options: {
      auth: 'jwt',
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

  // Routes CRUD uSers
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
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        parse: true,
        maxBytes: 10000000,
        multipart: {
          output: 'stream'
        }
      },
    }
  },

  // Routes Award
  {
    method: 'GET',
    path: '/awards',
    handler: getAllAwardsHandler,
    options: { auth: 'jwt' }, 
  },
  {
    method: 'POST',
    path: '/awards/redeem',
    handler: redeemAwardHandler,
    options: { auth: 'jwt' },
},
{
  method: 'GET',
  path: '/redeem-history',
  handler: getRedeemHistoryHandler,
  options: { auth: 'jwt' },
},
];

module.exports = routes;