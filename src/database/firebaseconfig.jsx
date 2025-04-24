import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Asegúrate de importar esto
import {getAuth} from "firebase/auth"
import { getStorage } from "firebase/storage"; // Agrega Firebase Storage
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

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

let db;
try {
  db = initializeFirestore(appfirebase, {
    localCache: persistentLocalCache({
      cacheSizeBytes: 100 * 1024 * 1024, // 100 MB (opcional, para limitar tamaño)
    }),
  });
  console.log("Firestore inicializado con persistencia offline.");
} catch (error) {
  console.error("Error al inicializar Firestore con persistencia:", error);
  // Fallback: inicializar sin persistencia si falla
  db = initializeFirestore(appfirebase, {});
}



const auth = getAuth(appfirebase);

const storage = getStorage(appfirebase);


export { appfirebase, db, auth, storage }; 
