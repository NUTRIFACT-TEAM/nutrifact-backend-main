require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const sequelize = require('./config/database');
const routes = require('./routes');
const { validateToken } = require('./config/token');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8080,
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

// Tangani unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});

init();
