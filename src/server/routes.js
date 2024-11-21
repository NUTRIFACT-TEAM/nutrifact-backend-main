const { postNewProductHandler, getProductbyScanHandler } = require('../server/handler');

const routes = [
  {
    path: '/products',
    method: 'POST',
    handler: postNewProductHandler,
    options: {
      payload: {
        parse: false,
        allow: 'multipart/form-data'
      }
    },
  },

  {
    path: '/products/{barcodeId}',
    method: 'GET',
    handler: getProductbyScanHandler
  }
]

module.exports = routes;