window.onload = () => {
    cargarHistorial();
}

function cargarHistorial() {
    let contenedor = document.getElementById("contenedorHistorial");
    
    if (contenedor === null) {
        return;
    }

    let historialGuardado = JSON.parse(localStorage.getItem("historialVentas"));

    contenedor.textContent = "";

    if (historialGuardado === null || historialGuardado === undefined || historialGuardado === "" || !Array.isArray(historialGuardado) || historialGuardado.length === 0) {
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
        granTotalVentas = granTotalVentas + (ticket.totalCobrado || 0);

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

        ["Producto", "Cantidad", "Subtotal"].forEach(texto => {
            let th = document.createElement("th");
            th.textContent = texto;
            trHead.appendChild(th);
        });

        thead.appendChild(trHead);
        tabla.appendChild(thead);

        let tbody = document.createElement("tbody");
        let listaSegura = ticket.productosComprados || ticket.producosComprados || [];
        
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