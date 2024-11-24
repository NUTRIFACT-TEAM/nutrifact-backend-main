const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const User = require('../../model/user');

const registerHandler = async (request, h) => {
  const { name, email, password } = request.payload;

  try {
    const isRegistered = await User.findOne({ where: { email } });

    if (isRegistered) {
      return h.response({ error: true, message: 'Email already registered' }).code(400);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = `user-${nanoid(16)}`;

    const newUser = await User.create({
      id,
      name,
      email,
      password: hashedPassword,
    });

    return h.response({
      error: false,
      message: 'User created',
      id: newUser.id,
    }).code(201);
  } catch (error) {
    console.error(error);
    return h.response({ error: true, message: 'Server error' }).code(500);
  }
};

module.exports = registerHandler;
