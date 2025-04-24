import React, {createContext, useContext, useState, useEffect,} from "react";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import { appfirebase } from "./firebaseconfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({children}) => {
    useEffect(() => {
        const handleOnline = () => {
          console.log("¡Conexión restablecida!");
          // Opcional: Mostrar una notificación más amigable (puedes usar un componente de notificación en lugar de alert)
          alert("¡Conexión restablecida!");
        };
        const handleOffline = () => {
          console.log("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
          alert("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
        };
    
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
    
        return () => {
          window.removeEventListener("online", handleOnline);
          window.removeEventListener("offline", handleOffline);
        };
      }, []);
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const auth = getAuth(appfirebase);
        const unsubcribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsLoggedIn(!!user);
        });
        return () => unsubcribe();
    }, []);
        const logout = async () => {
            const auth = getAuth(appfirebase);
            await signOut(auth);
            setIsLoggedIn(false);
        };
        return (
        <AuthContext.Provider value ={{user, isLoggedIn, logout}}>
            {children}
        </AuthContext.Provider>
    );
};