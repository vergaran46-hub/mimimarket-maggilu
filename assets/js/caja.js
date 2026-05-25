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

<<<<<<< Updated upstream
    // 1. Lógica del Menú Hamburguesa (Funciona en las 4 páginas del panel)
    let btnHamburguesaDash = document.getElementById("btnHamburguesaDash");
    let menuIzquierda = document.querySelector(".menuIzquierda");
=======
    let inventarioGuardado = JSON.parse(localStorage.getItem("inventarioMimi"));

    if (inventarioGuardado != null) {
        inventario = inventarioGuardado;
    } else {
        inventario = inventarioBase;
    }

    let textoGuardado = localStorage.getItem("boletaTemporal");
    let carritoGuardado = JSON.parse(textoGuardado);
>>>>>>> Stashed changes

    if (btnHamburguesaDash && menuIzquierda) {
        btnHamburguesaDash.addEventListener("click", () => {
            menuIzquierda.classList.toggle("menu-activo");
        });
    }

    // 2. Lógica del Punto de Venta / Boleta (Solo se ejecuta si existe la tabla en el HTML)
    let tablaInventario = document.getElementById("tablaInventario");
    
    if (tablaInventario) {
        let textoGuardado = localStorage.getItem("boletaTemporal");
        let carritoGuardado = JSON.parse(textoGuardado);

<<<<<<< Updated upstream
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
=======
    let btnFinalizar = document.getElementById("btnFinalizar");

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
            producosComprados: carrito,
            totalCobrado: totalVenta,
            metodoPago: metodoPagoActual
        };

        let historialGuardado = JSON.parse(localStorage.getItem("historiaVentas"));

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

            deudoresGuardados.push(reguistroDeuda);
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    carrito.splice(posicion, 1);
    localStorage.setItem("boletaTemporal", JSON.stringify(carrito));
=======

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

>>>>>>> Stashed changes
    actualizarBoleta();
    cargarCatalogo();
}


function vaciarBoleta() {
<<<<<<< Updated upstream
=======

    carrito.map(productoDevuelto => {
        let itemInventario = inventario.find(item => item.nombre === productoDevuelto.nombre);

        if (itemInventario != null) {

            itemInventario.cantidad = itemInventario.cantidad + productoDevuelto.cantidadCompra;

        }

    })


>>>>>>> Stashed changes
    carrito = [];
    localStorage.removeItem("boletaTemporal");
<<<<<<< Updated upstream
    actualizarBoleta();
=======
    localStorage.setItem("inventarioMimi", JSON.stringify(inventario));

    actualizarBoleta();
    cargarCatalogo();

}

function cambiarMetodo(metodoElegido) {
    metodoPagoActual = metodoElegido;

    document.getElementById("textoMetodo").innerHTML = metodoElegido;
>>>>>>> Stashed changes
}