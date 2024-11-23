const { initializeApp } = require("firebase/app");  // Ganti import dengan require
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyC6m6rd1nKmDNmm5DEmHcORqbngh7fB6r8",
  authDomain: "login-register-test-297c9.firebaseapp.com",
  projectId: "login-register-test-297c9",
  storageBucket: "login-register-test-297c9.firebasestorage.app",
  messagingSenderId: "70477070225",
  appId: "1:70477070225:web:c7f15ad14e223d68c12430",
  measurementId: "G-YXCMK7F23T"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };  // Ganti export default dengan module.exports
