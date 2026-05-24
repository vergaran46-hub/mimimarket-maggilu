let productosAlmacen = [
   { nombre: "Mercadería", descripcion: "Arroz, fideos, legumbres y aceite para el almuerzo diario.", imagen: "img/abarrotes.webp", alt: "Mercadería" },
   { nombre: "Lácteos", descripcion: "Quesos, cecinas, leche y yogurt frescos todos los días.", imagen: "img/productos2.jpg", alt: "Lácteos" },
   { nombre: "Aseo Personal y Hogar", descripcion: "Detergentes, cloro y productos de cuidado personal.", imagen: "img/01-PACK-BANO-3.webp", alt: "Artículos de aseo" }
];

let productosAntojos = [
   { nombre: "Bebidas Frías", descripcion: "Bebidas, jugos y aguas siempre heladas para refrescarte.", imagen: "img/Foto 1.jpg", alt: "Bebidas frías" },
   { nombre: "Snacks", descripcion: "Papas fritas, ramitas y frutos secos para compartir.", imagen: "img/1000000564.jpeg", alt: "Snacks y papas fritas" },
   { nombre: "Helados y Dulces", descripcion: "Galletas, chocolates y helados para el postre.", imagen: "img/images.jfif", alt: "Helados y dulces" }
];

function crearTarjetaProducto(producto) {
   let article = document.createElement("article");
   article.className = "producto-almacen";

   let img = document.createElement("img");
   img.src = producto.imagen;
   img.alt = producto.alt;
   img.loading = "lazy";

   let h3 = document.createElement("h3");
   h3.textContent = producto.nombre;

   let p = document.createElement("p");
   p.textContent = producto.descripcion;

   article.appendChild(img);
   article.appendChild(h3);
   article.appendChild(p);

   return article;
}

function renderizarProductos(lista, contenedor) {
   contenedor.textContent = "";

   if (lista.length === 0) {
      let aviso = document.createElement("p");
      aviso.textContent = "No se encontraron productos.";
      aviso.className = "aviso-sin-resultados";
      contenedor.appendChild(aviso);
      return;
   }

   lista.forEach(function (producto) {
      let tarjeta = crearTarjetaProducto(producto);
      contenedor.appendChild(tarjeta);
   });
}

function filtrarProductos(evento) {
   let termino = evento.target.value.toLowerCase().trim();

   let contenedorProductos = document.getElementById("contenedorProductos");
   let contenedorAntojos = document.getElementById("contenedorAntojos");

   let filtradosAlmacen = productosAlmacen.filter(function (producto) {
      return producto.nombre.toLowerCase().includes(termino) ||
         producto.descripcion.toLowerCase().includes(termino);
   });

   let filtradosAntojos = productosAntojos.filter(function (producto) {
      return producto.nombre.toLowerCase().includes(termino) ||
         producto.descripcion.toLowerCase().includes(termino);
   });

   renderizarProductos(filtradosAlmacen, contenedorProductos);
   renderizarProductos(filtradosAntojos, contenedorAntojos);
}

function aplicarModo(activar) {
   let btn = document.getElementById("btnModoOscuro");

   if (activar) {
      document.body.classList.add("dark-mode");
      btn.textContent = "☀️";
      btn.setAttribute("aria-label", "Activar modo claro");
   } else {
      document.body.classList.remove("dark-mode");
      btn.textContent = "🌙";
      btn.setAttribute("aria-label", "Activar modo oscuro");
   }
}

function toggleModoOscuro() {
   let modoActivo = document.body.classList.contains("dark-mode");
   let nuevoModo = !modoActivo;

   aplicarModo(nuevoModo);
   localStorage.setItem("modoOscuro", nuevoModo);
}

function cargarPreferenciaModo() {
   let preferencia = localStorage.getItem("modoOscuro");
   aplicarModo(preferencia === "true");
}

window.onload = function () {

   cargarPreferenciaModo();

   let btnModoOscuro = document.getElementById("btnModoOscuro");
   btnModoOscuro.addEventListener("click", toggleModoOscuro);

   let contenedorProductos = document.getElementById("contenedorProductos");
   let contenedorAntojos = document.getElementById("contenedorAntojos");

   renderizarProductos(productosAlmacen, contenedorProductos);
   renderizarProductos(productosAntojos, contenedorAntojos);

   let buscador = document.getElementById("buscadorProductos");
   buscador.addEventListener("input", filtrarProductos);
};
