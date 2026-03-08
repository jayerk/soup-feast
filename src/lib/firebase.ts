import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBGwk_xCXXWMdXdoeD3Gc72-UsERYrhVA",
  authDomain: "soup-feast.firebaseapp.com",
  projectId: "soup-feast",
  storageBucket: "soup-feast.firebasestorage.app",
  messagingSenderId: "500678233962",
  appId: "1:500678233962:web:322b73024d3ea1d8fd9f13",
  measurementId: "G-V8GVE5H5JN",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export default app;
