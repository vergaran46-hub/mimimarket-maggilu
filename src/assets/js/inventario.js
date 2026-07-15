// ============================================================
// INVENTARIO - CRUD completo en Firestore (colección "productos")
// ============================================================
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { protegerRuta, cerrarSesion } from "./authContext.js";

const coleccionProductos = collection(db, "productos");

// listaProductos guarda ahora también el id del documento de Firestore,
// necesario para poder editar/eliminar cada producto puntual.
let listaProductos = [];

function mostrarError(mensaje) {
    let contenedor = document.getElementById("estadoInventario");
    if (!contenedor) return;
    contenedor.innerHTML = `<p class="mensajeError">⚠️ ${mensaje}</p>`;
}

function limpiarEstado() {
    let contenedor = document.getElementById("estadoInventario");
    if (contenedor) contenedor.innerHTML = "";
}

function mostrarCargando() {
    let contenedor = document.getElementById("estadoInventario");
    if (contenedor) {
        contenedor.innerHTML = `<p class="estadoCarga"><span class="spinner"></span>Cargando inventario desde Firestore...</p>`;
    }
}

// Lectura en tiempo real desde Firestore (onSnapshot). Cada vez que
// cambian los datos en la nube, la tabla se refresca automáticamente.
function escucharInventario() {
    mostrarCargando();
    onSnapshot(
        coleccionProductos,
        (snapshot) => {
            listaProductos = snapshot.docs.map((docItem) => ({
                id: docItem.id,
                ...docItem.data(),
            }));
            limpiarEstado();
            renderizarTabla();
        },
        (error) => {
            console.error(error);
            mostrarError("No se pudo cargar el inventario. Verifica tu conexión o permisos.");
        }
    );
}

async function crearProducto() {
    let inputNombre = document.getElementById("iNombre");
    let inputPrecio = document.getElementById("iPrecio");
    let inputStock = document.getElementById("iStock");
    let btnAgregar = document.getElementById("btnAgregarProducto");

    let nombre = inputNombre.value.trim();
    let precio = inputPrecio.value.trim();
    let stock = inputStock.value.trim();

    if (nombre === "" || precio === "" || stock === "") {
        alert("Todos los campos son obligatorios. No puedes dejar campos vacíos.");
        return;
    }

    let precioNumero = Number(precio);
    let stockNumero = Number(stock);

    if (isNaN(precioNumero) || precioNumero <= 0) {
        alert("El precio debe ser un número mayor a 0.");
        return;
    }

    if (isNaN(stockNumero) || stockNumero < 0) {
        alert("El stock debe ser un número igual o mayor a 0.");
        return;
    }

    let productoExistente = listaProductos.find(
        (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
    );

    btnAgregar.disabled = true;
    let textoOriginal = btnAgregar.textContent;
    btnAgregar.textContent = "Guardando...";

    try {
        if (productoExistente) {
            // Producto ya existe: sumar stock y actualizar precio (updateDoc)
            await updateDoc(doc(db, "productos", productoExistente.id), {
                cantidad: productoExistente.cantidad + stockNumero,
                precio: precioNumero,
            });
        } else {
            // Producto nuevo (addDoc)
            await addDoc(coleccionProductos, {
                nombre: nombre,
                precio: precioNumero,
                cantidad: stockNumero,
            });
        }

        inputNombre.value = "";
        inputPrecio.value = "";
        inputStock.value = "";
    } catch (error) {
        console.error(error);
        mostrarError("No se pudo guardar el producto en Firestore. Intenta nuevamente.");
    } finally {
        btnAgregar.disabled = false;
        btnAgregar.textContent = textoOriginal;
    }
}

async function eliminarProducto(idProducto) {
    try {
        await deleteDoc(doc(db, "productos", idProducto));
    } catch (error) {
        console.error(error);
        mostrarError("No se pudo eliminar el producto. Intenta nuevamente.");
    }
}

async function editarProducto(idProducto, nombreActual, precioActual, stockActual) {
    let nuevoPrecio = prompt("Nuevo precio para " + nombreActual + ":", precioActual);
    if (nuevoPrecio === null) return;

    let nuevoStock = prompt("Nuevo stock para " + nombreActual + ":", stockActual);
    if (nuevoStock === null) return;

    let precioNumero = Number(nuevoPrecio);
    let stockNumero = Number(nuevoStock);

    if (isNaN(precioNumero) || precioNumero <= 0 || isNaN(stockNumero) || stockNumero < 0) {
        alert("Valores inválidos. No se realizaron cambios.");
        return;
    }

    try {
        await updateDoc(doc(db, "productos", idProducto), {
            precio: precioNumero,
            cantidad: stockNumero,
        });
    } catch (error) {
        console.error(error);
        mostrarError("No se pudo editar el producto. Intenta nuevamente.");
    }
}

function renderizarTabla() {
    let tablaProductos = document.getElementById("tablaProductos");
    if (!tablaProductos) return;

    tablaProductos.textContent = "";

    listaProductos.forEach(function (producto) {
        let tr = document.createElement("tr");

        let tdNombre = document.createElement("td");
        tdNombre.textContent = producto.nombre;

        let tdPrecio = document.createElement("td");
        tdPrecio.textContent = "$" + producto.precio;

        let tdStock = document.createElement("td");
        tdStock.textContent = producto.cantidad;

        let tdAccion = document.createElement("td");

        let btnEditar = document.createElement("button");
        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btnMini");
        btnEditar.addEventListener("click", function () {
            editarProducto(producto.id, producto.nombre, producto.precio, producto.cantidad);
        });

        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btnMini");
        btnEliminar.style.backgroundColor = "#cc0000";
        btnEliminar.addEventListener("click", function () {
            if (confirm("¿Eliminar " + producto.nombre + " del inventario?")) {
                eliminarProducto(producto.id);
            }
        });

        tdAccion.appendChild(btnEditar);
        tdAccion.appendChild(btnEliminar);

        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdStock);
        tr.appendChild(tdAccion);
        tablaProductos.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    // Ruta protegida: valida sesión real de Firebase Auth (no localStorage)
    await protegerRuta();

    escucharInventario();

    let btnAgregar = document.getElementById("btnAgregarProducto");
    if (btnAgregar) {
        btnAgregar.addEventListener("click", crearProducto);
    }

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
});
