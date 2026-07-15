// ============================================================
// LOGIN CON FIREBASE AUTHENTICATION
// ============================================================
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig.js";
import { onAuthChange } from "./authContext.js";

// Traduce los códigos de error de Firebase a mensajes
// comprensibles para el usuario (requisito de la rúbrica: los
// errores de Firebase deben mostrarse de forma comprensible).
function traducirErrorFirebase(codigo) {
    const mensajes = {
        "auth/invalid-email": "El correo ingresado no tiene un formato válido.",
        "auth/user-not-found": "No existe una cuenta registrada con ese correo.",
        "auth/wrong-password": "La contraseña ingresada es incorrecta.",
        "auth/invalid-credential": "Usuario o contraseña incorrectos.",
        "auth/too-many-requests": "Demasiados intentos fallidos. Intenta nuevamente en unos minutos.",
        "auth/network-request-failed": "Error de conexión. Revisa tu internet e intenta de nuevo.",
        "auth/missing-password": "Debes ingresar una contraseña.",
    };
    return mensajes[codigo] || "No fue posible iniciar sesión. Intenta nuevamente.";
}

window.onload = () => {
    // Si ya hay una sesión activa de Firebase, saltamos directo a Caja.
    onAuthChange((usuario) => {
        if (usuario) {
            window.location.href = "caja.html";
        }
    });

    let btnIngresar = document.getElementById("btnIngresar");
    let iUsuario = document.getElementById("iUsuario");
    let iClave = document.getElementById("iClave");
    let mensajeGeneral = document.getElementById("mensajeGeneral");

    if (!btnIngresar) return;

    btnIngresar.addEventListener("click", () => {
        realizarLogin();
    });

    // Permitir enviar con Enter
    iClave.addEventListener("keydown", (e) => {
        if (e.key === "Enter") realizarLogin();
    });

    async function realizarLogin() {
        let vUsuario = iUsuario.value.trim();
        let vClave = iClave.value;

        mensajeGeneral.textContent = "";
        mensajeGeneral.style.color = "";

        if (vUsuario === "" || vClave === "") {
            mensajeGeneral.textContent = "Debes ingresar correo y contraseña.";
            mensajeGeneral.style.color = "red";
            return;
        }

        // Estado de carga mientras Firebase valida las credenciales
        btnIngresar.disabled = true;
        let textoOriginal = btnIngresar.textContent;
        btnIngresar.textContent = "Ingresando...";

        try {
            await signInWithEmailAndPassword(auth, vUsuario, vClave);
            // El listener de onAuthChange se encarga de redirigir a caja.html
        } catch (error) {
            mensajeGeneral.textContent = traducirErrorFirebase(error.code);
            mensajeGeneral.style.color = "red";
        } finally {
            btnIngresar.disabled = false;
            btnIngresar.textContent = textoOriginal;
        }
    }
};
