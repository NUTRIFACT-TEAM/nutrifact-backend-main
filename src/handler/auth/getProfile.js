const { Firestore } = require('@google-cloud/firestore');
const { getImageProfile } = require('../../services/user/getImageProfile');

const getProfileHandler = async (request, h) => {
  const userId = request.auth.credentials.user.id;
  const db = new Firestore();
  const usersCollection = db.collection('users');

  try {
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      return h.response({ status: 404, message: 'User not found' }).code(404);
    }

    const userData = userDoc.data();

    
    const profileImageURL = await getImageProfile(userId);

    return h.response({
      status: 200,
      message: 'User profile fetched successfully',
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        profileImageURL,
        points: userData.points
      },
    }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ status: 500, message: 'Server error' }).code(500);
  }
};

module.exports = getProfileHandler;
