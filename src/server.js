require('dotenv').config(); 
const Hapi = require('@hapi/hapi');
const routes = require('./routes');
// const loadModel = require('../services/loadModel');
// const InputError = require('../exceptions/InputError');
 
const init = async () => {
    const server = Hapi.server({
      port: process.env.PORT || 8080,
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
      routes: {
        cors: {
          origin: ['*'], // Mengaktifkan CORS untuk semua origin
        },
      },
    });
 
    // const model = await loadModel();
    // server.app.model = model;

    // server.ext('onPreResponse', function (request, h) {
    //     const response = request.response;
    
    //     if (response instanceof InputError) {
    //         const newResponse = h.response({
    //             status: 'fail',
    //             message: `${response.message} Silakan gunakan foto lain.`
    //         });
    //         newResponse.code(response.statusCode);
    //         return newResponse;
    //     }
    
    //     if (response.isBoom) {
    //         // Menangani kasus error dengan kode status tertentu
    //         if (response.output.statusCode === 413) {
    //             return h.response({
    //                 status: 'fail',
    //                 message: 'Payload content length greater than maximum allowed: 1000000'
    //             }).code(413);
    //         }
    
    //         const newResponse = h.response({
    //             status: 'fail',
    //             message: response.message
    //         });
    //         newResponse.code(response.output.statusCode);
    //         return newResponse;
    //     }
    
    //     return h.continue;
    // });
    
    server.route([
        {
          method: 'GET',
          path: '/',
          handler: () => ({ message: 'API is up and running!' }),
        },
      ]);
    
      await server.start();
      console.log(`Server running at: ${server.info.uri}`);
    };
    
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      process.exit(1);
    });
    
    init();