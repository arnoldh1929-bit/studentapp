
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Điền cấu hình Firebase của bạn vào đây
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
