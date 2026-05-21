window.onload = (e) => {
    let btnIngresar = document.getElementById("btnIngresar");

    btnIngresar.addEventListener("click", () => {

        let iUsuario = document.getElementById("iUsuario");
        let iClave = document.getElementById("iClave");
        let mensajeGeneral = document.getElementById("mensajeGeneral");

        let vUsuario = iUsuario.value;
        let vClave = iClave.value;

        if(vUsuario === "miriam" && vClave === "caja2026") {
            window.location.href = "caja.html";
        } else {
            mensajeGeneral.innerText = "Usuario o Contraseña incorrectos"
            mensajeGeneral.style.color = "red"
        }

    }

    )
}