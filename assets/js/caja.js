let inventario = [
    { nombre: "Arroz", precio: 1350, cantidad: 5 },
    { nombre: "Aceite", precio: 1000, cantidad: 5},
    { nombre: "Coca cola cero", precio: 1200, cantidad: 5 },
    { nombre: "Marraqueta", precio: 100, cantidad: 5 },
    { nombre: "Papas Fritas", precio: 500, cantidad: 5 },
    { nombre: "Hallulla", precio: 200, cantidad: 5 }
];

let carrito = [];

window.onload = () => {

    // 1. Lógica del Menú Hamburguesa)
    let btnHamburguesaDash = document.getElementById("btnHamburguesaDash");
    let menuIzquierda = document.querySelector(".menuIzquierda");

    if (btnHamburguesaDash && menuIzquierda) {
        btnHamburguesaDash.addEventListener("click", () => {
            menuIzquierda.classList.toggle("menu-activo");
        });
    

    // VALIDACIÓN DE FORMULARIO Y PROTECCIÓN ANTI-XSS
    let formAdmin = document.getElementById("formAdmin");

    if (formAdmin) {
        formAdmin.addEventListener("submit", (evento) => {
            evento.preventDefault();

            let nombre = document.getElementById("fNombre").value.trim();
            let correo = document.getElementById("fCorreo").value.trim();
            let mensaje = document.getElementById("fMensaje").value.trim();
            let mensajeAlerta = document.getElementById("mensajeAlerta");

            let regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            mensajeAlerta.textContent = "";

            if (nombre === "" || correo === "" || mensaje === "") {
                mensajeAlerta.style.color = "red";
                mensajeAlerta.textContent = "Error: Todos los campos son obligatorios.";
                return;
            }

            if (!regexCorreo.test(correo)) {
                mensajeAlerta.style.color = "red";
                mensajeAlerta.textContent = "Error: Debes ingresar un correo electrónico válido.";
                return;
            }

            mensajeAlerta.style.color = "green";
            
            mensajeAlerta.textContent = "¡Registro exitoso! El cliente " + nombre + " ha sido ingresado al sistema.";

            formAdmin.reset();
        });
    }    
    }

    // 2. Lógica del Punto de Venta / Boleta 
    let tablaInventario = document.getElementById("tablaInventario");
    
    if (tablaInventario) {
        let textoGuardado = localStorage.getItem("boletaTemporal");
        let carritoGuardado = JSON.parse(textoGuardado);

        if (carritoGuardado != null) {
            carrito = carritoGuardado;
        } else {
            carrito = [];
        }

        cargarCatalogo();
        actualizarBoleta();

        let btnFinalizar = document.getElementById("btnFinalizar");
        if (btnFinalizar) {
            btnFinalizar.addEventListener("click", () => {
                if (carrito.length > 0) {
                    alert("Venta exitosa");
                    carrito = [];
                    localStorage.removeItem("boletaTemporal");
                    actualizarBoleta();
                } else {
                    alert("No hay productos");
                }
            });
        }
    }
};

function cargarCatalogo() {
    let tablaInventario = document.getElementById("tablaInventario");
    if (!tablaInventario) return;

    let filasHTML = inventario.map((producto, index) => {
        return "<tr>" +  "<td>" + producto.nombre + "</td>" + "<td>$" + producto.precio + "</td>" + "<td>" + producto.cantidad + "</td>" + "<td><button onclick='agregarAlCarrito(" + index + ")'>+</button></td>" + "</tr>";
    });

    tablaInventario.innerHTML = filasHTML.join("");
}

function agregarAlCarrito(posicion) {
    let productoSeleccionado = inventario[posicion];
    carrito.push(productoSeleccionado);
    
    localStorage.setItem("boletaTemporal", JSON.stringify(carrito));
    
    actualizarBoleta();
}

function actualizarBoleta() {
    let tablaCarrito = document.getElementById("tablaCarrito");
    let totalPagar = document.getElementById("totalPagar");
    if (!tablaCarrito || !totalPagar) return;

    let sumaTotal = 0;

    let filasCarrito = carrito.map((producto, index) => {
        sumaTotal = sumaTotal + producto.precio;

        return "<tr>" + "<td>" + producto.nombre + "</td>" + "<td>$" + producto.precio + "</td>" + "<td><button onclick='eliminarUno(" + index + ")'>X</button></td>" + "</tr>";
    });

    tablaCarrito.innerHTML = filasCarrito.join("");
    totalPagar.innerHTML = sumaTotal;
}

function eliminarUno(posicion) {
    carrito.splice(posicion, 1);
    localStorage.setItem("boletaTemporal", JSON.stringify(carrito));
    actualizarBoleta();
}

function vaciarBoleta() {
    carrito = [];
    localStorage.removeItem("boletaTemporal");
    actualizarBoleta();
}