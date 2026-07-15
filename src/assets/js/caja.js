// ============================================================
// CAJA PRINCIPAL - Firestore (productos, ventas, deudores)
// ============================================================
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { protegerRuta, cerrarSesion } from "./authContext.js";

const coleccionProductos = collection(db, "productos");
const coleccionVentas = collection(db, "ventas");
const coleccionDeudores = collection(db, "deudores");

let inventario = []; // reflejo en tiempo real de Firestore (con id de documento)
// El carrito/boleta es estado temporal de la sesión de venta (no es un
// dato de negocio persistente), por lo que se mantiene en memoria del
// navegador y no se migra a Firestore.
let carrito = [];
let metodoPagoActual = "";

function mostrarEstado(mensaje, tipo) {
    let contenedor = document.getElementById("estadoCaja");
    if (!contenedor) return;
    let clase = tipo === "error" ? "mensajeError" : "estadoCarga";
    let icono = tipo === "error" ? "⚠️" : "";
    contenedor.innerHTML = `<p class="${clase}">${icono} ${mensaje}</p>`;
}

function limpiarEstado() {
    let contenedor = document.getElementById("estadoCaja");
    if (contenedor) contenedor.innerHTML = "";
}

function escucharInventario() {
    mostrarEstado("Cargando catálogo desde Firestore...", "carga");
    onSnapshot(
        coleccionProductos,
        (snapshot) => {
            inventario = snapshot.docs.map((docItem) => ({
                id: docItem.id,
                ...docItem.data(),
            }));
            limpiarEstado();
            cargarCatalogo();
        },
        (error) => {
            console.error(error);
            mostrarEstado("No se pudo cargar el catálogo de productos.", "error");
        }
    );
}

document.addEventListener("DOMContentLoaded", async () => {
    // Ruta protegida por Firebase Auth
    await protegerRuta();

    // Menú Hamburguesa
    let btnHamburguesaDash = document.getElementById("btnHamburguesaDash");
    let menuIzquierda = document.querySelector(".menuIzquierda");
    let contenido = document.querySelector(".contenido");

    if (btnHamburguesaDash && menuIzquierda) {
        btnHamburguesaDash.addEventListener("click", () => {
            menuIzquierda.classList.toggle("menu-activo");
            contenido.classList.toggle("mover-derecha");
        });
    }

    let btnCerrarSesion = document.getElementById("btnCerrarSesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", async () => {
            await cerrarSesion();
        });
    }

    let tablaInventario = document.getElementById("tablaInventario");
    if (!tablaInventario) return;

    let carritoGuardado = JSON.parse(localStorage.getItem("boletaTemporal"));
    carrito = carritoGuardado != null ? carritoGuardado : [];

    escucharInventario();
    actualizarBoleta();

    let inputBuscador = document.getElementById("iBuscador");
    if (inputBuscador) {
        inputBuscador.addEventListener("input", function () {
            let textoBusqueda = inputBuscador.value.trim().toLowerCase();
            if (textoBusqueda === "") {
                cargarCatalogo();
            } else {
                let productosFiltrados = inventario.filter((p) =>
                    p.nombre.toLowerCase().indexOf(textoBusqueda) !== -1
                );
                cargarCatalogo(productosFiltrados);
            }
        });
    }

    let btnFinalizar = document.getElementById("btnFinalizar");
    if (btnFinalizar) {
        btnFinalizar.addEventListener("click", () => finalizarVenta(btnFinalizar));
    }

    let btnVaciar = document.getElementById("btnVaciar");
    if (btnVaciar) {
        btnVaciar.addEventListener("click", vaciarBoleta);
    }

    let btnEfectivo = document.getElementById("btnEfectivo");
    if (btnEfectivo) btnEfectivo.addEventListener("click", () => cambiarMetodo("Efectivo"));

    let btnTarjeta = document.getElementById("btnTarjeta");
    if (btnTarjeta) btnTarjeta.addEventListener("click", () => cambiarMetodo("Tarjeta"));

    let btnFiado = document.getElementById("btnFiado");
    if (btnFiado) btnFiado.addEventListener("click", () => cambiarMetodo("Fiado"));
});

function cargarCatalogo(listaParaMostrar) {
    let tablaInventario = document.getElementById("tablaInventario");
    if (!tablaInventario) return;

    if (listaParaMostrar == null) listaParaMostrar = inventario;

    tablaInventario.textContent = "";

    listaParaMostrar.forEach(function (producto) {
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
        btn.addEventListener("click", function () {
            agregarAlCarrito(producto.id);
        });
        tdBtn.appendChild(btn);

        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdCant);
        tr.appendChild(tdBtn);

        tablaInventario.appendChild(tr);
    });
}

async function agregarAlCarrito(idProducto) {
    let productoInventario = inventario.find((p) => p.id === idProducto);
    if (!productoInventario) return;

    if (productoInventario.cantidad <= 0) {
        alert("No queda stock de " + productoInventario.nombre);
        return;
    }

    try {
        // Descuenta stock en Firestore de inmediato (reserva del producto)
        await updateDoc(doc(db, "productos", idProducto), {
            cantidad: productoInventario.cantidad - 1,
        });

        let productoCarrito = carrito.find((item) => item.idProducto === idProducto);
        if (productoCarrito != null) {
            productoCarrito.cantidadCompra += 1;
        } else {
            carrito.push({
                idProducto: idProducto,
                nombre: productoInventario.nombre,
                precio: productoInventario.precio,
                cantidadCompra: 1,
            });
        }

        localStorage.setItem("boletaTemporal", JSON.stringify(carrito));
        actualizarBoleta();
    } catch (error) {
        console.error(error);
        mostrarEstado("No se pudo agregar el producto al carrito.", "error");
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
        sumaTotal += subtotalFila;

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

async function eliminarUno(posicion) {
    let productoDevuelto = carrito[posicion];

    try {
        let productoInventario = inventario.find((p) => p.id === productoDevuelto.idProducto);
        if (productoInventario) {
            await updateDoc(doc(db, "productos", productoDevuelto.idProducto), {
                cantidad: productoInventario.cantidad + 1,
            });
        }

        productoDevuelto.cantidadCompra -= 1;
        if (productoDevuelto.cantidadCompra === 0) {
            carrito.splice(posicion, 1);
        }

        localStorage.setItem("boletaTemporal", JSON.stringify(carrito));
        actualizarBoleta();
    } catch (error) {
        console.error(error);
        mostrarEstado("No se pudo devolver el producto al inventario.", "error");
    }
}

async function vaciarBoleta() {
    try {
        for (let productoDevuelto of carrito) {
            let productoInventario = inventario.find((p) => p.id === productoDevuelto.idProducto);
            if (productoInventario) {
                await updateDoc(doc(db, "productos", productoDevuelto.idProducto), {
                    cantidad: productoInventario.cantidad + productoDevuelto.cantidadCompra,
                });
            }
        }
        carrito = [];
        localStorage.removeItem("boletaTemporal");
        actualizarBoleta();
    } catch (error) {
        console.error(error);
        mostrarEstado("No se pudo vaciar la boleta correctamente.", "error");
    }
}

function cambiarMetodo(metodoElegido) {
    metodoPagoActual = metodoElegido;
    document.getElementById("textoMetodo").textContent = metodoElegido;
}

async function finalizarVenta(btnFinalizar) {
    if (carrito.length === 0) {
        alert("No hay productos en la boleta.");
        return;
    }
    if (metodoPagoActual === "") {
        alert("Debe seleccionar un método de pago");
        return;
    }

    let totalVenta = carrito.reduce((acc, p) => acc + p.precio * p.cantidadCompra, 0);

    btnFinalizar.disabled = true;
    let textoOriginal = btnFinalizar.textContent;
    btnFinalizar.textContent = "Procesando...";
    mostrarEstado("Registrando venta en Firestore...", "carga");

    try {
        if (metodoPagoActual === "Fiado") {
            let nombreCliente = prompt("Esta venta se registrará como FIADO. Ingrese el nombre del cliente: ");
            if (nombreCliente == null || nombreCliente.trim() === "") {
                nombreCliente = "Cliente por identificar";
            }

            await addDoc(coleccionDeudores, {
                cliente: nombreCliente,
                fechaInicial: new Date().toLocaleString(),
                totalDeuda: totalVenta,
                productos: carrito,
                metodoPago: "Fiado",
            });

            alert("Fiado registrado a nombre de: " + nombreCliente);
        } else {
            await addDoc(coleccionVentas, {
                fecha: new Date().toLocaleString(),
                productosComprados: carrito,
                totalCobrado: totalVenta,
                metodoPago: metodoPagoActual,
            });

            alert("Venta registrada con éxito.");
        }

        carrito = [];
        metodoPagoActual = "";
        document.getElementById("textoMetodo").textContent = "";
        localStorage.removeItem("boletaTemporal");
        actualizarBoleta();
        limpiarEstado();
    } catch (error) {
        console.error(error);
        mostrarEstado("No se pudo registrar la venta. Intenta nuevamente.", "error");
    } finally {
        btnFinalizar.disabled = false;
        btnFinalizar.textContent = textoOriginal;
    }
}
