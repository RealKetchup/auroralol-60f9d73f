import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA_q8vrITwpt5vzIElYK-lOXBXrfkcHVe0",
  authDomain: "auroraslols.firebaseapp.com",
  projectId: "auroraslols",
  storageBucket: "auroraslols.firebasestorage.app",
  messagingSenderId: "910728833600",
  appId: "1:910728833600:web:9abfe994e05cd26fc08da5",
  measurementId: "G-T15FKH513V"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const analytics = getAnalytics(app);
