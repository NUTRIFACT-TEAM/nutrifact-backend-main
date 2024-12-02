const { postNewProductHandler, getProductbyScanHandler } = require('./handler/product/handler');
const loginHandler = require('./handler/auth/login');
const registerHandler = require('./handler/auth/register');
const getProfileHandler = require('./handler/auth/getProfile');
const updateProfileHandler = require('./handler/auth/update');
const {postNewAwardHandler, getAllAwardsHandler,redeemAwardHandler} = require('./handler/award/handlerAward');


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
  {
    method: 'POST',
    path: '/awards',
    handler: postNewAwardHandler,
    options: {
      auth: 'jwt', 
      payload: {
        allow: 'multipart/form-data',
        output: 'stream',
        parse: true,
        maxBytes: 10000000,
        multipart: { output: 'stream' },
      },
    },
  },
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
}
];

module.exports = routes;