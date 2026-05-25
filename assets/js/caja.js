let inventario = [
    { nombre: "Arroz", precio: 1350, cantidad: 5 },
    { nombre: "Aceite", precio: 1000, cantidad: 5 },
    { nombre: "Coca cola cero", precio: 1200, cantidad: 5 },
    { nombre: "Marraqueta", precio: 100, cantidad: 5 },
    { nombre: "Papas Fritas", precio: 500, cantidad: 5 },
    { nombre: "Hallulla", precio: 200, cantidad: 5 }
];

let carrito = [];

// --- Inicialización (defer garantiza que el DOM está listo) ---

// 1. Lógica del Menú Hamburguesa (Funciona en las 4 páginas del panel)
let btnHamburguesaDash = document.getElementById("btnHamburguesaDash");
let menuIzquierda = document.querySelector(".menuIzquierda");

if (btnHamburguesaDash && menuIzquierda) {
    btnHamburguesaDash.addEventListener("click", () => {
        menuIzquierda.classList.toggle("menu-activo");
    });
}

// 2. Lógica del Punto de Venta / Boleta
let textoGuardado = localStorage.getItem("boletaTemporal");
let carritoGuardado = JSON.parse(textoGuardado);

if (carritoGuardado != null) {
    carrito = carritoGuardado;
} else {
    carrito = [];
}

cargarCatalogo();
actualizarBoleta();

// --- Event Listeners de botones fijos ---

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

let btnVaciar = document.getElementById("btnVaciar");

if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        carrito = [];
        localStorage.removeItem("boletaTemporal");
        actualizarBoleta();
    });
}

// --- Renderizado seguro del catálogo (createElement + textContent) ---

function cargarCatalogo() {
    let tablaInventario = document.getElementById("tablaInventario");
    if (!tablaInventario) return;

    tablaInventario.textContent = "";

    inventario.forEach((producto, index) => {
        let fila = document.createElement("tr");

        let celdaNombre = document.createElement("td");
        celdaNombre.textContent = producto.nombre;

        let celdaPrecio = document.createElement("td");
        celdaPrecio.textContent = "$" + producto.precio;

        let celdaStock = document.createElement("td");
        celdaStock.textContent = producto.cantidad;

        let celdaBoton = document.createElement("td");
        let botonAgregar = document.createElement("button");
        botonAgregar.textContent = "+";
        botonAgregar.addEventListener("click", () => {
            agregarAlCarrito(index);
        });
        celdaBoton.appendChild(botonAgregar);

        fila.appendChild(celdaNombre);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaStock);
        fila.appendChild(celdaBoton);

        tablaInventario.appendChild(fila);
    });
}

// --- Agregar producto al carrito ---

function agregarAlCarrito(posicion) {
    let productoSeleccionado = inventario[posicion];
    carrito.push(productoSeleccionado);

    localStorage.setItem("boletaTemporal", JSON.stringify(carrito));

    actualizarBoleta();
}

// --- Renderizado seguro de la boleta (createElement + textContent) ---

function actualizarBoleta() {
    let tablaCarrito = document.getElementById("tablaCarrito");
    let totalPagar = document.getElementById("totalPagar");
    if (!tablaCarrito || !totalPagar) return;

    let sumaTotal = 0;

    tablaCarrito.textContent = "";

    carrito.forEach((producto, index) => {
        sumaTotal = sumaTotal + producto.precio;

        let fila = document.createElement("tr");

        let celdaNombre = document.createElement("td");
        celdaNombre.textContent = producto.nombre;

        let celdaPrecio = document.createElement("td");
        celdaPrecio.textContent = "$" + producto.precio;

        let celdaBoton = document.createElement("td");
        let botonEliminar = document.createElement("button");
        botonEliminar.textContent = "X";
        botonEliminar.addEventListener("click", () => {
            eliminarUno(index);
        });
        celdaBoton.appendChild(botonEliminar);

        fila.appendChild(celdaNombre);
        fila.appendChild(celdaPrecio);
        fila.appendChild(celdaBoton);

        tablaCarrito.appendChild(fila);
    });

    totalPagar.textContent = sumaTotal;
}

// --- Eliminar un producto del carrito ---

function eliminarUno(posicion) {
    carrito.splice(posicion, 1);

    localStorage.setItem("boletaTemporal", JSON.stringify(carrito));

    actualizarBoleta();
}