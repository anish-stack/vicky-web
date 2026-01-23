// import firebase from "firebase/app";
// import "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyBbM0r2kKeRTY-k_1-_itxyzxO04JC9oyc",
//   authDomain: "vickycab-services.firebaseapp.com",
//   projectId: "vickycab-services",
//   storageBucket: "vickycab-services.firebasestorage.app",
//   messagingSenderId: "368495145751",
//   appId: "1:368495145751:web:fdf61f548f7a356b553d52",
//   measurementId: "G-V6HBNZGQCK"
// };

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// } else {
//   firebase.app();
// }

// export default firebase;

// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, PhoneAuthProvider, signInWithPhoneNumber, RecaptchaVerifierParameters  } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBbM0r2kKeRTY-k_1-_itxyzxO04JC9oyc",
  authDomain: "vickycab-services.firebaseapp.com",
  projectId: "vickycab-services",
  storageBucket: "vickycab-services.firebasestorage.app",
  messagingSenderId: "368495145751",
  appId: "1:368495145751:web:fdf61f548f7a356b553d52",
  measurementId: "G-V6HBNZGQCK"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth, RecaptchaVerifier, PhoneAuthProvider, signInWithPhoneNumber, RecaptchaVerifierParameters };

