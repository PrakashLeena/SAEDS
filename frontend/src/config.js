import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAAq5pyl5oTxYZpiYKesH0HTeyph66sSCk",
  authDomain: "saeds-c04b1.firebaseapp.com",
  projectId: "saeds-c04b1",
  storageBucket: "saeds-c04b1.firebasestorage.app",
  messagingSenderId: "190411788882",
  appId: "1:190411788882:web:541f6f42d4552a1456858b",
  measurementId: "G-ZHLVKFDBHF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth, analytics };
export default app;