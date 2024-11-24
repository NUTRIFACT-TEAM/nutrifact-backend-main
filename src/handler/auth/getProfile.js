const User = require('../../model/user');

const getProfileHandler = async (request, h) => {
  const { userId } = request.params;

  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return h.response({ status: 400, message: 'User not found', }).code(400);
    }

    return h.response({ status: 200, message: 'Profile retrieved successfully',
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
      },
    }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({
      status: 500,
      message: 'Server error',
    }).code(500);
  }
};

module.exports = getProfileHandler;
