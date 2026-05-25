let inventarioBase = [
    { nombre: "Arroz", precio: 1350, cantidad: 5 },
    { nombre: "Aceite", precio: 1000, cantidad: 5},
    { nombre: "Coca cola cero", precio: 1200, cantidad: 5 },
    { nombre: "Marraqueta", precio: 100, cantidad: 5 },
    { nombre: "Papas Fritas", precio: 500, cantidad: 5 },
    { nombre: "Hallulla", precio: 200, cantidad: 5 }
];

let inventario = [];
let carrito = [];
let metodoPagoActual= "";

window.onload = () => {

 HEAD
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

 HEAD
    // 2. Lógica del Punto de Venta / Boleta 

    let inventarioGuardado = JSON.parse(localStorage.getItem("inventarioMimi"));

    if (inventarioGuardado != null) {
        inventario = inventarioGuardado;
    } else {
        inventario = inventarioBase;
    }

    
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

                if (carrito.length === 0) {
                    alert("No hay productos en la boleta.");
                    return;
                }

                if (metodoPagoActual === "") {
                    alert("Debe seleccionar un metodo de pago");
                    return;
                }

                let totalVenta = 0;

                carrito.map(prod => {
                    totalVenta = totalVenta + (prod.precio * prod.cantidadCompra);
                });

                let ticket = {
                    fecha: new Date().toLocaleString(),
                    productosComprados: carrito,
                    totalCobrado: totalVenta,
                    metodoPago: metodoPagoActual
                };

                let historialGuardado = JSON.parse(localStorage.getItem("historialVentas"));

                if (historialGuardado == null) {
                    historialGuardado = [];
                }

                historialGuardado.push(ticket);
                localStorage.setItem("historialVentas", JSON.stringify(historialGuardado));

                if (metodoPagoActual === "Fiado") {

                    let nombreCliente = prompt("Esta venta se registrará como FIADO. Ingrese el nombre del cliente: ");

                    if (nombreCliente == null || nombreCliente.trim() === "") {
                        nombreCliente = "Cliente por identificar";
                    }

                    let registroDeuda = {
                        cliente: nombreCliente,
                        fecha: ticket.fecha,
                        totalDeuda: totalVenta,
                        productos: carrito
                    };

                    let deudoresGuardados = JSON.parse(localStorage.getItem("listaDeudores"));
                    if (deudoresGuardados == null) {
                        deudoresGuardados = [];
                    }

                    deudoresGuardados.push(registroDeuda);
                    localStorage.setItem("listaDeudores", JSON.stringify(deudoresGuardados));
                }

                alert("Venta registrada con exito a las: " + ticket.fecha);

                carrito = [];
                metodoPagoActual = "";
                document.getElementById("textoMetodo").innerText = "";

                localStorage.removeItem("boletaTemporal");
                localStorage.setItem("inventarioMimi", JSON.stringify(inventario));

                actualizarBoleta();
                cargarCatalogo();
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
    let productoInventario = inventario[posicion];

    if (productoInventario.cantidad > 0) {
        productoInventario.cantidad = productoInventario.cantidad - 1;

        let productoCarrito = carrito.find(item => item.nombre === productoInventario.nombre);

        if (productoCarrito != null) {
            productoCarrito.cantidadCompra = productoCarrito.cantidadCompra + 1;
        } else {
            carrito.push({
                nombre: productoInventario.nombre,
                precio: productoInventario.precio,
                cantidadCompra: 1
            });
        }

        localStorage.setItem("boletaTemporal", JSON.stringify(carrito));
        localStorage.setItem("inventarioMimi", JSON.stringify(inventario));

        actualizarBoleta();
        cargarCatalogo();

    } else {
        alert("No queda stock de " + productoInventario.nombre)
    }
}

function actualizarBoleta() {
    let tablaCarrito = document.getElementById("tablaCarrito");
    let totalPagar = document.getElementById("totalPagar");
    if (!tablaCarrito || !totalPagar) return;

    let sumaTotal = 0;

    let filasCarrito = carrito.map((producto, index) => {

        let subtotalFila = producto.precio * producto.cantidadCompra;
        sumaTotal = sumaTotal + subtotalFila;

        return "<tr>" +
                    "<td>" + producto.nombre + "</td>" +
                    "<td>$" + producto.precio + "</td>" +
                    "<td>" + producto.cantidadCompra + "</td>" +
                    "<td>$" + subtotalFila + "</td>" +
                    "<td><button onclick='eliminarUno(" + index + ")'>X</button></td>" +
                "</tr>";

    });

    tablaCarrito.innerHTML = filasCarrito.join("");
    totalPagar.innerHTML = sumaTotal;
}

function eliminarUno(posicion) {

    let productoDevuelto = carrito[posicion];
    let itemInventario = inventario.find(item => item.nombre === productoDevuelto.nombre);

    if (itemInventario != null) {
        itemInventario.cantidad = itemInventario.cantidad + 1;
    }

    productoDevuelto.cantidadCompra = productoDevuelto.cantidadCompra - 1;

    if (productoDevuelto.cantidadCompra === 0) {
        carrito.splice(posicion, 1);
    }

    localStorage.setItem("boletaTemporal", JSON.stringify(carrito));
    localStorage.setItem("inventarioMimi", JSON.stringify(inventario));

    actualizarBoleta();
    cargarCatalogo();
}

function vaciarBoleta() {

    carrito.map(productoDevuelto => {
        let itemInventario = inventario.find(item => item.nombre === productoDevuelto.nombre);

        if (itemInventario != null) {
            itemInventario.cantidad = itemInventario.cantidad + productoDevuelto.cantidadCompra;
        }
    })

    carrito = [];
    localStorage.removeItem("boletaTemporal");
    localStorage.setItem("inventarioMimi", JSON.stringify(inventario));

    actualizarBoleta();
    cargarCatalogo();
}

function cambiarMetodo(metodoElegido) {
    metodoPagoActual = metodoElegido;
    document.getElementById("textoMetodo").innerHTML = metodoElegido;
}