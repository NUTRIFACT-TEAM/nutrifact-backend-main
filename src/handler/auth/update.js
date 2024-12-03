const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcrypt');
const { updateImageProfile } = require('../../services/user/storeImageProfile');

const updateProfileHandler = async (request, h) => {
  const { name, password, image} = request.payload;
  const userId = request.auth.credentials.user.id;
  const db = new Firestore();
  const usersCollection = db.collection('users');

  if (!name && !password && !image) {
    return h.response({
      status: 400,
      message: 'At least one field (name or password or image) is required',
    }).code(400);
  }

  try {
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return h.response({ status: 404, message: 'User not found' }).code(404);
    }

    let updateData = {};
    if (name) {
      updateData.name = name;
      await usersCollection.doc(userId).update(updateData);
    }
    if (password) {
      updateData.password = bcrypt.hashSync(password, 10);
      await usersCollection.doc(userId).update(updateData);
    }
    if (image) {
      // data = "blablablablabla"
      await updateImageProfile(userId, image, image.hapi.filename);
      // updateData.image = data;
    }

  
    // await usersCollection.doc(userId).update(updateData);

    // if (request.payload.file) {
    //   const fileStream = request.payload.file;
    //   const originalName = fileStream.hapi.filename;
    //   await updateImageProfile(userId, fileStream, originalName);
    // }

    return h.response({
      status: 200,
      message: 'Profile updated successfully',
    }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ status: 500, message: 'Server error' }).code(500);
  }
};

module.exports = updateProfileHandler;
