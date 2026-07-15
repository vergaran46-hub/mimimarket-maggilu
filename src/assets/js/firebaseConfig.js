// ============================================================
// CONFIGURACIÓN SEGURA DE FIREBASE
// ============================================================
// Las credenciales NUNCA se escriben aquí como texto plano.
// Se leen desde variables de entorno (archivo .env, que está
// en .gitignore y por lo tanto no se sube al repositorio).
//
// Vite expone las variables que empiezan con "VITE_" a través
// de import.meta.env. Ver .env.example para la lista de
// variables necesarias y cómo obtenerlas.
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Aviso en consola si falta configurar el .env (ayuda a depurar
// en desarrollo, no expone ningún dato sensible).
if (!firebaseConfig.apiKey) {
    console.warn(
        "Firebase no está configurado. Copia .env.example a .env y completa tus credenciales."
    );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
