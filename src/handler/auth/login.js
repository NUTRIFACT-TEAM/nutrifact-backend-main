// const User = require('../../model/user');
const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../config/token');

const loginHandler = async (request, h) => {
  const { email, password } = request.payload;
  const db = new Firestore();
  const usersCollection = db.collection('users');

  try {
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    if (userSnapshot.empty) {
      return h.response({ status: 401, message: 'User not found' }).code(401);
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const isValid = await bcrypt.compare(password, userData.password);
    if (!isValid) {
      return h.response({ status: 401, message: 'Wrong password' }).code(401);
    }

    const token = generateToken(userData);
    return h.response({
      status: 200,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
        },
      },
    }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ status: 401, message: 'Invalid credentials' }).code(401);
  }
};

module.exports = loginHandler;
