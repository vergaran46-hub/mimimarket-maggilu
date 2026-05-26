window.onload = () => {

    // Lógica del Menu Hamburguesa
    let btnHamburguesaDash = document.getElementById("btnHamburguesaDash");
    let menuIzquierda = document.querySelector(".menuIzquierda");

    if(btnHamburguesaDash && menuIzquierda) {
        btnHamburguesaDash.addEventListener("click", () => {
            menuIzquierda.classList.toggle("menu-activo");
        });
    }

    // Cargar la tabla de fiados pendientes
    cargarDeudores();

    // Lógica del formulario Validación, anti-XSS y guardado en localstorage
    let formAdmin = document.getElementById("formAdmin");

    if (formAdmin) {
        formAdmin.addEventListener("submit", (evento) => {
            evento.preventDefault();

            let nombre = document.getElementById("fNombre").value.trim();
            let correo = document.getElementById("fCorreo").value.trim();
            let mensaje = document.getElementById("fMensaje").value.trim();
            let mensajeAlerta = document.getElementById("mensajeAlerta");

            // Regex para validar formato de correo
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

            //  Guardado en localstorage
            let directorioGuardado = JSON.parse(localStorage.getItem("directorioClientes"));
            if (directorioGuardado === null) {
                directorioGuardado = []; 
            }

            let nuevoCliente = {
                id: Date.now(), 
                nombre: nombre,
                correo: correo,
                detalle: mensaje,
                fechaRegistro: new Date().toLocaleDateString()
            };

            directorioGuardado.push(nuevoCliente);
            localStorage.setItem("directorioClientes", JSON.stringify(directorioGuardado));

            mensajeAlerta.style.color = "green";
            mensajeAlerta.textContent = "¡Registro exitoso! Los datos de " + nombre + " han sido guardados en el sistema.";

            formAdmin.reset();
        });
    }
}

function cargarDeudores() {
    let contenedor = document.getElementById("contenedorDeudores");

    if (contenedor === null) {
        return
    };

    let deudoresGuardados = JSON.parse(localStorage.getItem("listaDeudores"));

    contenedor.textContent = "";

    if (deudoresGuardados === null || deudoresGuardados === undefined || deudoresGuardados === "" || Array.isArray(deudoresGuardados) === false || deudoresGuardados.length === 0) {

        let h2 = document.createElement("h2");
        h2.className = "tituloSeccion";
        h2.style.color = "#28a745";
        h2.textContent = "No hay fiados pagados"
        contenedor.appendChild(h2);
        return;
    }

    deudoresGuardados.forEach((deuda, index) => {

        let divCaja = document.createElement("div");
        divCaja.className = "caja tarjetaHistorial";

        let h2Titulo = document.createElement("h2");
        h2Titulo.className = "tituloCaja";
        h2Titulo.textContent = "Cliente: " + (deuda.cliente || "Desconocido");

        let pFecha = document.createElement("p");
        pFecha.className = "textoTarjeta";
        let bFecha = document.createElement("b");
        bFecha.textContent = "Fecha de Fiado: ";
        pFecha.appendChild(bFecha);
        pFecha.appendChild(document.createTextNode(deuda.fechaInicial || "Sin fecha"));

        let tabla = document.createElement("table");
        tabla.border = "1";
        tabla.className = "tablaMini";
        tabla.style.width = "100%";
        tabla.style.marginTop = "10px";
        tabla.style.marginBottom = "10px";

        let thead = document.createElement("thead");
        let trHead = document.createElement("tr");
        ["Producto", "Cantidad", "Subtotal"].forEach(texto => {
            let th = document.createElement("th");
            th.textContent = texto;
            trHead.appendChild(th);
        });

        thead.appendChild(trHead);
        tabla.appendChild(thead);

        let tbody = document.createElement("tbody");
        let listaSegura = deuda.productos || [];


        listaSegura.forEach(prod => {

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
        h3Total.style.textAlign = "right";
        h3Total.style.color = "#dc3545"; 
        h3Total.textContent = "Total a Pagar: $" + (deuda.totalDeuda || 0);

        let btnPagar = document.createElement("button");
        btnPagar.textContent = "Marcar como Pagado";
        btnPagar.className = "btn-mimi"; 
        btnPagar.style.backgroundColor = "#28a745"; 
        btnPagar.style.width = "100%"; 
        btnPagar.style.marginTop = "15px"; 
        btnPagar.addEventListener("click", () => cobrarFiado(index));

        divCaja.appendChild(h2Titulo);
        divCaja.appendChild(pFecha);
        divCaja.appendChild(tabla);
        divCaja.appendChild(h3Total);
        divCaja.appendChild(btnPagar);

        contenedor.appendChild(divCaja);
    });

}

function cobrarFiado(posicion) {
    let deudoresGuardados = JSON.parse(localStorage.getItem("listaDeudores"));
    if (deudoresGuardados === null) {
        deudoresGuardados = [];
    }
    
    let deudaPagada = deudoresGuardados[posicion];

    let confirmacion = confirm("¿Confirmas el pago de $" + deudaPagada.totalDeuda + " por parte del cliente " + deudaPagada.cliente + "?");
    
    if (confirmacion) {
        deudoresGuardados.splice(posicion, 1);
        localStorage.setItem("listaDeudores", JSON.stringify(deudoresGuardados));

        let ticketParaHistorial = {
            fecha: new Date().toLocaleString(), 
            productosComprados: deudaPagada.productos,
            totalCobrado: deudaPagada.totalDeuda,
            metodoPago: "Fiado (Pagado por " + deudaPagada.cliente + ")" 
        };

        let historialGuardado = JSON.parse(localStorage.getItem("historialVentas"));
        if (historialGuardado === null) {
            historialGuardado = [];
        }
        
        historialGuardado.push(ticketParaHistorial);
        localStorage.setItem("historialVentas", JSON.stringify(historialGuardado));

        alert("¡Pago exitoso! El registro se movió al Historial del Negocio.");
        cargarDeudores();
    }
}