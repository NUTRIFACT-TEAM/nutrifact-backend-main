const User = require('../../model/user');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../config/token');

const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  if (!email || !password) {
    return h.response({ status: 400, message: 'Missing required data', }).code(400);
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return h.response({ status: 401, message: 'User not found', }).code(401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return h.response({ status: 401, message: 'Wrong password', }).code(401);
    }

    const token = generateToken(user);
    return h.response({
      status: 200,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({
      status: 401,
      message: 'Invalid credentials',
    }).code(401);
  }
};

module.exports = loginHandler;
