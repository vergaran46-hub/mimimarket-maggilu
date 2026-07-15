// ============================================================
// HISTORIAL DE VENTAS - lectura desde Firestore (colección "ventas")
// ============================================================
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import { protegerRuta, cerrarSesion } from "./authContext.js";

const coleccionVentas = collection(db, "ventas");

document.addEventListener("DOMContentLoaded", async () => {
    await protegerRuta();

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

    escucharHistorial();
});

function escucharHistorial() {
    let contenedor = document.getElementById("contenedorHistorial");
    if (!contenedor) return;

    contenedor.innerHTML = `<p class="estadoCarga"><span class="spinner"></span>Cargando historial desde Firestore...</p>`;

    onSnapshot(
        coleccionVentas,
        (snapshot) => {
            let historialGuardado = snapshot.docs.map((docItem) => ({
                id: docItem.id,
                ...docItem.data(),
            }));
            renderizarHistorial(historialGuardado);
        },
        (error) => {
            console.error(error);
            contenedor.innerHTML = `<p class="mensajeError">⚠️ No se pudo cargar el historial. Verifica tu conexión o permisos.</p>`;
        }
    );
}

function renderizarHistorial(historialGuardado) {
    let contenedor = document.getElementById("contenedorHistorial");
    if (!contenedor) return;

    contenedor.textContent = "";

    if (!historialGuardado || historialGuardado.length === 0) {
        let h2 = document.createElement("h2");
        h2.className = "tituloSeccion";
        h2.textContent = "No hay ventas registradas aún.";
        contenedor.appendChild(h2);
        return;
    }

    let granTotalVentas = 0;

    let tituloTotal = document.createElement("h2");
    tituloTotal.className = "tituloSeccion";
    tituloTotal.style.color = "#28a745";
    tituloTotal.style.marginBottom = "20px";
    contenedor.appendChild(tituloTotal);

    historialGuardado.forEach((ticket, index) => {
        granTotalVentas += ticket.totalCobrado || 0;

        let divCaja = document.createElement("div");
        divCaja.className = "caja tarjetaHistorial";

        let h2Titulo = document.createElement("h2");
        h2Titulo.className = "tituloCaja";
        h2Titulo.textContent = "Boleta #" + (index + 1);

        let pFecha = document.createElement("p");
        pFecha.className = "textoTarjeta";
        let bFecha = document.createElement("b");
        bFecha.textContent = "Fecha: ";
        pFecha.appendChild(bFecha);
        pFecha.appendChild(document.createTextNode(ticket.fecha || "Sin fecha"));

        let pMetodo = document.createElement("p");
        pMetodo.className = "textoTarjeta";
        let bMetodo = document.createElement("b");
        bMetodo.textContent = "Método de Pago: ";
        let spanMetodo = document.createElement("span");
        spanMetodo.className = "metodoDestacado";
        spanMetodo.textContent = ticket.metodoPago || "No especificado";
        pMetodo.appendChild(bMetodo);
        pMetodo.appendChild(spanMetodo);

        let tabla = document.createElement("table");
        tabla.className = "tablaMini";

        let thead = document.createElement("thead");
        let trHead = document.createElement("tr");
        ["Producto", "Cantidad", "Subtotal"].forEach((texto) => {
            let th = document.createElement("th");
            th.textContent = texto;
            trHead.appendChild(th);
        });
        thead.appendChild(trHead);
        tabla.appendChild(thead);

        let tbody = document.createElement("tbody");
        let listaSegura = ticket.productosComprados || [];

        listaSegura.forEach((prod) => {
            let subtotal = (prod.precio || 0) * (prod.cantidadCompra || 0);
            let trFila = document.createElement("tr");

            let tdNombre = document.createElement("td");
            tdNombre.textContent = prod.nombre || "Desconocido";

            let tdCant = document.createElement("td");
            tdCant.textContent = prod.cantidadCompra || 0;

            let tdSub = document.createElement("td");
            tdSub.textContent = "$" + subtotal;

            trFila.appendChild(tdNombre);
            trFila.appendChild(tdCant);
            trFila.appendChild(tdSub);
            tbody.appendChild(trFila);
        });
        tabla.appendChild(tbody);

        let h3Total = document.createElement("h3");
        h3Total.className = "totalTexto";
        h3Total.textContent = "Total cobrado: $" + (ticket.totalCobrado || 0);

        divCaja.appendChild(h2Titulo);
        divCaja.appendChild(pFecha);
        divCaja.appendChild(pMetodo);
        divCaja.appendChild(tabla);
        divCaja.appendChild(h3Total);

        contenedor.appendChild(divCaja);
    });

    tituloTotal.textContent = "Total Acumulado del Negocio: $" + granTotalVentas;
}
