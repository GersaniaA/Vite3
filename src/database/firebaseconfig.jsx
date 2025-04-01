import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Asegúrate de importar esto
import {getAuth} from "firebase/auth"
import { getStorage } from "firebase/storage"; // Agrega Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyDdGyaXkvsdzGpAlGupZf_9NFx4qNqy9hM",
  authDomain: "vite-8af48.firebaseapp.com",
  projectId: "vite-8af48",
  storageBucket: "vite-8af48.firebasestorage.app",
  messagingSenderId: "796621177176",
  appId: "1:796621177176:web:3f3ac92ec7dc0e5757652d",
  measurementId: "G-MNVM77WF6K"
};


const appfirebase = initializeApp(firebaseConfig);

const db = getFirestore(appfirebase);

const auth = getAuth(appfirebase);

const storage = getStorage(appfirebase);


export { appfirebase, db, auth, storage }; 
