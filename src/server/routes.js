const { postPredictHandler, postNewProductHandler } = require('../server/handler');

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
  }
]

module.exports = routes;