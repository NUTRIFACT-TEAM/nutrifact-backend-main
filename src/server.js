require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const sequelize = require('./config/database');
const routes = require('./routes');
const { validateToken } = require('./config/token');
// const loadModel = require('../services/loadModel');
// const InputError = require('../exceptions/InputError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
    host: 'localhost', 
    routes: {
      cors: { origin: ['*'] },
    },
  });

// const model = await loadModel();
  // server.app.model = model;

  // server.ext('onPreResponse', function (request, h) {
  //     const response = request.response;
  
  //     if (response instanceof InputError) {
  //         const newResponse = h.response({
  //             status: 'fail',
  //             message: ${response.message} Silakan gunakan foto lain.
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

  await server.register(Jwt);


  const jwtConfig = {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: process.env.JWT_AUDIENCE,
      iss: process.env.JWT_ISSUER,
      sub: process.env.JWT_SUB,
    },
    validate: validateToken,
  };

  server.auth.strategy('jwt_auth', 'jwt', jwtConfig);


  server.route(routes);


  try {
    await sequelize.sync({ alter: true });
    console.log('Database connected and synchronized!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

init();