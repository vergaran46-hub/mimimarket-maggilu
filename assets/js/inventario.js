let listaProductos = [];


function cargarProductos() {
    let datosGuardados = localStorage.getItem("inventarioMimi");

    if (datosGuardados != null) {
        listaProductos = JSON.parse(datosGuardados);
    } else {
        listaProductos = [];
    }
}


function guardarProductos() {
    localStorage.setItem("inventarioMimi", JSON.stringify(listaProductos));
}

function crearProducto() {
    let inputNombre = document.getElementById("iNombre");
    let inputPrecio = document.getElementById("iPrecio");
    let inputStock = document.getElementById("iStock");

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

    let nuevoProducto = {
        nombre: nombre,
        precio: precioNumero,
        cantidad: stockNumero
    };

    listaProductos.push(nuevoProducto);

    guardarProductos();

    inputNombre.value = "";
    inputPrecio.value = "";
    inputStock.value = "";
    renderizarTabla();
}


function eliminarProducto(posicion) {
    listaProductos.splice(posicion, 1);
    guardarProductos();
    renderizarTabla();
}


function renderizarTabla() {
    let tablaProductos = document.getElementById("tablaProductos");
    if (!tablaProductos) return;

    tablaProductos.textContent = "";

    listaProductos.forEach(function (producto, index) {
        let tr = document.createElement("tr");

        let tdNombre = document.createElement("td");
        tdNombre.textContent = producto.nombre;

        let tdPrecio = document.createElement("td");
        tdPrecio.textContent = "$" + producto.precio;

        let tdStock = document.createElement("td");
        tdStock.textContent = producto.cantidad;

        let tdAccion = document.createElement("td");
        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btnMini");
        btnEliminar.style.backgroundColor = "#cc0000";
        btnEliminar.addEventListener("click", function () {
            eliminarProducto(index);
        });
        tdAccion.appendChild(btnEliminar);

        tr.appendChild(tdNombre);
        tr.appendChild(tdPrecio);
        tr.appendChild(tdStock);
        tr.appendChild(tdAccion);
        tablaProductos.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();
    renderizarTabla();

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
});
