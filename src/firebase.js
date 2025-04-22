import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  signInWithPopup 
} from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBXggzbfaM2pzjXj7WZXtD7Oxi07CNrzps",
  authDomain: "analyse-project-c2b3e.firebaseapp.com",
  databaseURL: "https://analyse-project-c2b3e-default-rtdb.firebaseio.com",
  projectId: "analyse-project-c2b3e",
  storageBucket: "analyse-project-c2b3e.firebasestorage.app",
  messagingSenderId: "876720006838",
  appId: "1:876720006838:web:be2513769758ed5314a817",
  measurementId: "G-5RP86P8P50"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getDatabase(app);

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { 
  auth, 
  googleProvider, 
  db, 
  signInWithEmailAndPassword,
  signInWithPopup 
};