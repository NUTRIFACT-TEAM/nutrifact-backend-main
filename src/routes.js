const { postNewProductHandler, getProductbyScanHandler } = require('../handler/grade/handler');

const routes = [
  {
    path: '/products',
    method: 'POST',
    handler: postNewProductHandler,
    options: {
      payload: {
        parse: true,
        multipart: true,
        // output: 'data',
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