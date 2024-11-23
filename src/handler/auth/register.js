const { db } = require('../../config/firebase-config'); // Pastikan path benar
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const { collection, query, where, getDocs, addDoc } = require('firebase/firestore');
const jwt = require('jsonwebtoken');  

const registerHandler = async (request, h) => {
  const { name, email, password } = request.payload;

  if (!name || !email || !password) {
    return h.response({ error: true, message: 'Missing required data' }).code(400);
  }


  const q = query(collection(db, 'users'), where('email', '==', email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return h.response({ error: true, message: 'Email already registered' }).code(400);
  }


  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = `user-${nanoid(16)}`;


  const docRef = await addDoc(collection(db, 'users'), {
    id,
    name,
    email,
    password: hashedPassword,
  });

 
  const newUser = {
    id: docRef.id,
    name,
    email,
  };


  return h.response({
    error: false,
    message: 'User created',
    user: newUser,
  }).code(201);
};

module.exports = registerHandler;
