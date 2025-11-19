// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// import {firebase} from "firebase"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVYLFmSx36EPR5Hi4UAAUiPo_oGoSPgUw",
  authDomain: "to-api-6a8b5.firebaseapp.com",
  projectId: "to-api-6a8b5",
  storageBucket: "to-api-6a8b5.appspot.com",
  messagingSenderId: "68568748353",
  appId: "1:68568748353:web:8ce4398e55bbf21aae91c0",
  measurementId: "G-WW8CJFVZCL"
};

// Initialize Firebase
export const app  =  initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);