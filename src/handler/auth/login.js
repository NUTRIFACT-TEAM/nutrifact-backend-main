const User = require('../../model/user');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../config/token');

const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  if (!email || !password) {
    return h.response({ error: true, message: 'Missing required data' }).code(400);
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return h.response({ error: true, message: 'User not found' }).code(401);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return h.response({ error: true, message: 'Wrong password' }).code(401);
    }

    const token = generateToken(user);
    return h.response({
      error: false,
      message: 'Login success',
      loginResult: {
        userId: user.id,
        name: user.name,
        token,
      },
    }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ error: true, message: 'Server error' }).code(500);
  }
};

module.exports = loginHandler;
