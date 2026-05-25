function inicializarModoOscuro() {

    let temaGuardado = localStorage.getItem("tema");

    if (temaGuardado === "dark") {
        document.body.classList.add("dark-mode");
    }

    let btnModoOscuro = document.getElementById("btnModoOscuro");

    if (btnModoOscuro) {
        actualizarIconoBoton(btnModoOscuro);
        btnModoOscuro.addEventListener("click", function () {
            document.body.classList.toggle("dark-mode");
            let temaActual = document.body.classList.contains("dark-mode");

            if (temaActual) {
                localStorage.setItem("tema", "dark");
            } else {
                localStorage.setItem("tema", "light");
            }

            actualizarIconoBoton(btnModoOscuro);
        });
    }
}

function actualizarIconoBoton(boton) {
    let esModoOscuro = document.body.classList.contains("dark-mode");
    if (esModoOscuro) {
        boton.textContent = "☀️";
        boton.setAttribute("aria-label", "Desactivar modo oscuro");
    } else {
        boton.textContent = "🌙";
        boton.setAttribute("aria-label", "Activar modo oscuro");
    }
}

document.addEventListener("DOMContentLoaded", inicializarModoOscuro);
