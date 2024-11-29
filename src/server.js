require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();
const routes = require('./routes');
const { validateToken } = require('./config/token');
// const loadModel = require('../services/loadModel');
// const InputError = require('../exceptions/InputError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost', 
    routes: {
      cors: { origin: ['*'] },
    },
  });

  await server.register(Jwt);


  const jwtConfig = {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: process.env.JWT_AUDIENCE,
      iss: process.env.JWT_ISSUER,
      sub: false,
    },
    validate: validateToken,
  };

  
  server.auth.strategy('jwt', 'jwt', jwtConfig);

  // server.auth.default('jwt_auth'); INI kalo di uncomment, bakal error di /login


  server.route(routes);


try {
  console.log('Firestore connected successfully!');
} catch (error) {
  console.error('Firestore connection failed:', error.message);
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