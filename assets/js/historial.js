window.onload = () => {
    cargarHistorial();
}

function cargarHistorial() {
    let contenedor = document.getElementById("contenedorHistorial");

    let historialGuardado = JSON.parse(localStorage.getItem("historialVentas"));

    if (historialGuardado == null || historialGuardado.length === 0) {
        contenedor.innerHTML = "<h2 class='tituloSeccion'>No hay ventas registradas en el historial.</h2>";
        return;
    }

    let granTotalVentas = 0;

    let htmlBoletas = historialGuardado.map((ticket, index) => {

        granTotalVentas = granTotalVentas + ticket.totalCobrado;

        let filasProductos = ticket.productosComprados.map(prod => {
            let subtotal = prod.precio * prod.cantidadCompra;
            return "<tr>" +
                       "<td>" + prod.nombre + "</td>" +
                       "<td>" + prod.cantidadCompra + "</td>" +
                       "<td>$" + subtotal + "</td>" +
                   "</tr>";
        });


        return "<div class='caja tarjetaHistorial'>" +
                   "<h2 class='tituloCaja'>Boleta #" + (index + 1) + "</h2>" +
                   "<p class='textoTarjeta'><b>Fecha:</b> " + ticket.fecha + "</p>" +
                   "<p class='textoTarjeta'><b>Método de Pago:</b> <span class='metodoDestacado'>" + ticket.metodoPago + "</span></p>" +
                   
                   "<table border='1' class='tablaMini' style='width: 100%; margin-top: 10px; margin-bottom: 10px;'>" +
                       "<thead>" +
                           "<tr>" +
                               "<th>Producto</th>" +
                               "<th>Cant.</th>" +
                               "<th>Subtotal</th>" +
                           "</tr>" +
                       "</thead>" +
                       "<tbody>" + filasProductos.join("") + "</tbody>" +
                   "</table>" +
                   
                   "<h3 class='totalTexto' style='text-align: right;'>Total cobrado: $" + ticket.totalCobrado + "</h3>" +
               "</div>";

    });

    let htmlGranTotal = "<h2 style='color: #28a745; margin-bottom: 20px;'>Total Acumulado del Negocio: $" + granTotalVentas + "</h2>";

    contenedor.innerHTML = htmlGranTotal + htmlBoletas.join("");

}