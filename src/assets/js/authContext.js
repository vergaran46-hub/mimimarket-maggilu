// ============================================================
// AUTH CONTEXT (versión vanilla JS)
// ============================================================
// Este proyecto no usa React, por lo que no existe un
// AuthContext/Provider en el sentido literal de React.
// Este módulo cumple el mismo rol: es la ÚNICA fuente de verdad
// sobre el estado de sesión en toda la aplicación.
//
// - Usa onAuthStateChanged de Firebase Auth (no localStorage)
//   para saber si hay un usuario logueado.
// - Expone el usuario actual (currentUser).
// - Permite que cualquier página "se suscriba" a los cambios
//   de sesión, igual que un componente consumiría el contexto
//   en React con useContext(AuthContext).
// - Ofrece un helper (protegerRuta) para las páginas privadas.
// ============================================================

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig.js";

let currentUser = null;
let sesionResuelta = false; // evita parpadeos mientras Firebase resuelve el estado inicial
const listeners = [];

// onAuthStateChanged es el "corazón" del AuthContext: Firebase avisa
// automáticamente cada vez que el usuario inicia o cierra sesión,
// o cuando la página se recarga y ya existía una sesión activa.
onAuthStateChanged(auth, (usuarioFirebase) => {
    currentUser = usuarioFirebase; // objeto de Firebase (auth.currentUser) o null
    sesionResuelta = true;
    listeners.forEach((callback) => callback(currentUser));
});

/**
 * Se suscribe a los cambios de sesión.
 * Equivalente a leer el AuthContext dentro de un componente.
 */
export function onAuthChange(callback) {
    listeners.push(callback);
    if (sesionResuelta) callback(currentUser);
    return () => {
        const i = listeners.indexOf(callback);
        if (i !== -1) listeners.splice(i, 1);
    };
}

export function getCurrentUser() {
    return currentUser;
}

/**
 * Cierre de sesión centralizado con Firebase.
 */
export async function cerrarSesion() {
    await signOut(auth);
}

/**
 * Protege una página: si no hay sesión de Firebase Auth activa,
 * redirige al login. Se usa en caja.html, deudores.html,
 * inventario.html e historial.html.
 *
 * IMPORTANTE: la validación se hace contra el estado real de
 * Firebase Auth (onAuthStateChanged), nunca contra localStorage.
 */
export function protegerRuta() {
    return new Promise((resolve) => {
        const unsub = onAuthChange((usuario) => {
            if (!usuario) {
                window.location.href = "login.html";
            } else {
                resolve(usuario);
            }
        });
    });
}
