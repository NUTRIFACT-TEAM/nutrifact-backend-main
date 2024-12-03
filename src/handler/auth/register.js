const { Firestore } = require('@google-cloud/firestore');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const { storeImageProfile } = require('../../services/user/storeImageProfile');

const registerHandler = async (request, h) => {
  const { name, email, password } = request.payload;
  const db = new Firestore();
  const usersCollection = db.collection('users');

  try {
    const userSnapshot = await usersCollection.where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return h.response({ status: 400, message: 'Email already exists' }).code(400);
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = `user-${nanoid(16)}`;

    
    await usersCollection.doc(id).set({
      id,
      name,
      email,
      password: hashedPassword,
      points: 0, //tambah variabel baru (points)
      createdAt: new Date().toISOString(),
    });

    await storeImageProfile(id);

    return h.response({
      status: 201,
      message: 'User registered successfully',
      data: { id, name, email },
    }).code(201);
  } catch (error) {
    console.error(error);
    return h.response({ status: 500, message: 'Server error' }).code(500);
  }
};

module.exports = registerHandler;
