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

    // Lógica del Menu Hamburguesa
    let btnHamburguesaDash = document.getElementById("btnHamburguesaDash");
    let menuIzquierda = document.querySelector(".menuIzquierda");

    if (btnHamburguesaDash && menuIzquierda) {
        btnHamburguesaDash.addEventListener("click", () => {
            menuIzquierda.classList.toggle("menu-activo");
        });
    }


    // Lógica del punto de venta / boleta 
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
                    alert("Debe seleccionar un método de pago");
                    return;
                }

                let totalVenta = 0;
                carrito.forEach(prod => {
                    totalVenta = totalVenta + (prod.precio * prod.cantidadCompra);
                });

                if (metodoPagoActual === "Fiado") {
                    let nombreCliente = prompt("Esta venta se registrará como FIADO. Ingrese el nombre del cliente: ");
                    if (nombreCliente == null || nombreCliente.trim() === "") {
                        nombreCliente = "Cliente por identificar";
                    }

                    let registroDeuda = {
                        cliente: nombreCliente,
                        fechaInicial: new Date().toLocaleString(),
                        totalDeuda: totalVenta,
                        productos: carrito,
                        metodoPago: "Fiado"
                    };

                    let deudoresGuardados = JSON.parse(localStorage.getItem("listaDeudores"));
                    if (deudoresGuardados == null) {
                        deudoresGuardados = [];
                    }
                    
                    deudoresGuardados.push(registroDeuda);
                    localStorage.setItem("listaDeudores", JSON.stringify(deudoresGuardados));
                    
                    alert("Fiado registrado a nombre de: " + nombreCliente);

                } else {
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

                    alert("Venta registrada con exito a las: " + ticket.fecha);
                }

                carrito = [];
                metodoPagoActual = "";
                document.getElementById("textoMetodo").textContent = "";

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

    tablaInventario.textContent = "";

    inventario.forEach((producto, index) => {
        let tr = document.createElement("tr");

        let tdNombre = document.createElement("td");
        tdNombre.textContent = producto.nombre;
        
        let tdPrecio = document.createElement("td");
        tdPrecio.textContent = "$" + producto.precio;
        
        let tdCant = document.createElement("td");
        tdCant.textContent = producto.cantidad;
        
        let tdBtn = document.createElement("td");
        let btn = document.createElement("button");
        btn.textContent = "+";
        btn.addEventListener("click", () => agregarAlCarrito(index));
        tdBtn.appendChild(btn);

        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdCant);
        tr.appendChild(tdBtn);

        tablaInventario.appendChild(tr);
    });
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

    tablaCarrito.textContent = "";
    let sumaTotal = 0;

    carrito.forEach((producto, index) => {
        let subtotalFila = producto.precio * producto.cantidadCompra;
        sumaTotal = sumaTotal + subtotalFila;

        let tr = document.createElement("tr");

        let tdNombre = document.createElement("td");
        tdNombre.textContent = producto.nombre;

        let tdPrecio = document.createElement("td");
        tdPrecio.textContent = "$" + producto.precio;

        let tdCant = document.createElement("td");
        tdCant.textContent = producto.cantidadCompra;

        let tdSub = document.createElement("td");
        tdSub.textContent = "$" + subtotalFila;

        let tdBtn = document.createElement("td");
        let btn = document.createElement("button");
        btn.textContent = "X";
        btn.addEventListener("click", () => eliminarUno(index));
        tdBtn.appendChild(btn);

        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdCant);
        tr.appendChild(tdSub);
        tr.appendChild(tdBtn);

        tablaCarrito.appendChild(tr);
    });

    totalPagar.textContent = sumaTotal;
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
    carrito.forEach(productoDevuelto => {
        let itemInventario = inventario.find(item => item.nombre === productoDevuelto.nombre);
        if (itemInventario != null) {
            itemInventario.cantidad = itemInventario.cantidad + productoDevuelto.cantidadCompra;
        }
    });

    carrito = [];
    localStorage.removeItem("boletaTemporal");
    localStorage.setItem("inventarioMimi", JSON.stringify(inventario));

    actualizarBoleta();
    cargarCatalogo();
}

function cambiarMetodo(metodoElegido) {
    metodoPagoActual = metodoElegido;
    document.getElementById("textoMetodo").textContent = metodoElegido;
}