const bcrypt = require('bcrypt');
const User = require('../../model/user');
const { updateImageProfile } = require('../../services/user/storeImageProfile');

const updateProfileHandler = async (request, h) => {
  const { name, password, image } = request.payload;

  console.log('recieved payload: ', request.payload)
  const userId = request.auth.credentials.user.id; 

  if (!name && !password && !image) {
    return h.response({
      status: 400,
      message: 'At least one field (name or password) is required',
    }).code(400);
  }

  try {
    const user = await User.findOne({ where: { id: userId } });
    if (image) {
      console.log(image.hapi.filename);
      await updateImageProfile(userId, image, image.hapi.filename);
    }

    if (!user) {
      return h.response({
        status: 404,
        message: 'User not found',
      }).code(404);
    }

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.update({
      name: name || user.name, 
      password: hashedPassword || user.password, 
    });

    return h.response({
      status: 200,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
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

module.exports = updateProfileHandler;
