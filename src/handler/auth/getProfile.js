const User = require('../../model/user');

const getProfileHandler = async (request, h) => {
  const userId = request.auth.credentials.user.id; 
  
  try {
    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return h.response({
        status: 404,
        message: 'User not found',
      }).code(404);
    }

    return h.response({
      status: 200,
      message: 'User profile fetched successfully',
      data: {
        id: user.id,
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
