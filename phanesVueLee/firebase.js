import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDY24-iduLisNm3AvRufED7CmEwQj8UOjE",
  authDomain: "phaneseditor-dafff.firebaseapp.com",
  projectId: "phaneseditor-dafff",
  storageBucket: "phaneseditor-dafff.firebasestorage.app",
  messagingSenderId: "457046463534",
  appId: "1:457046463534:web:38c601dab702b8ca51fbbf",
  measurementId: "G-7B2QRMDL4K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { firebaseConfig };