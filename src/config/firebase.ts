// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCZJ1ajjVvWsByKDDTQvkYZq9NJZ1Yyza0",
  authDomain: "inventory-mangement-syst-1d25e.firebaseapp.com",
  databaseURL: "https://inventory-mangement-syst-1d25e-default-rtdb.firebaseio.com",
  projectId: "inventory-mangement-syst-1d25e",
  storageBucket: "inventory-mangement-syst-1d25e.firebasestorage.app",
  messagingSenderId: "940459813989",
  appId: "1:940459813989:web:2099cc4623590752852a8c",
  measurementId: "G-2JFM1GKT7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth, analytics };
export default app;