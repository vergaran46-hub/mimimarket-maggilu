# MIMImarket & MaggiLu

## 1. Descripción del Emprendimiento
MIMImarket es un almacén de barrio ubicado en Copiapó que ofrece productos de despensa diaria, combinado con MaggiLu, un servicio de arreglos de rosas eternas y regalos personalizados para ocasiones especiales.

## 2. Necesidad Digital
El negocio requiere una plataforma web para digitalizar su catálogo de productos y servicios, permitiendo a los clientes de la comunidad conocer la oferta disponible, horarios de atención y facilitar el contacto directo vía WhatsApp e Instagram. Además, cuenta con un sistema interno de gestión (caja, inventario, deudores e historial) para la administración diaria del negocio.

## 3. Secciones del Sitio
##- **Inicio:** Presentación de la marca y propuesta de valor.
##- **Quiénes Somos:** Misión y visión de la empresa.
##- **MIMImarket (Despensa y Antojos):** Catálogo de productos de abarrotes y snacks.
##- **MaggiLu:** Galería interactiva de arreglos florales y regalos temáticos.
##- **Contacto:** Información de ubicación, horarios y enlaces a redes sociales.
##- **Panel interno (login requerido):** Caja Principal, Inventario, Deudores e Historial.

## 4. Integrantes
##- **Ignacio Vergara Soto**
##- **Abraham Arancibia**
##- **Herbert Urtubia**

## 5. URL del Proyecto
https://vergaran46-hub.github.io/mimimarket-maggilu/

---

## 6. Evaluación Sumativa 4 — Migración a Firebase

A partir de la ES4, el panel interno (caja, inventario, deudores, historial)
dejó de usar `localStorage` como base de datos simulada y ahora usa:

##- **Firebase Authentication** para el inicio de sesión.
##- **Cloud Firestore** para persistir productos, ventas, fiados y clientes.

### 6.1 Instalación y ejecución local

```bash
# 1. Instalar dependencias
##npm install

# 2. Configurar las variables de entorno
##cp .env.example .env
# Completa .env con los datos de TU proyecto de Firebase (ver sección 6.2)

# 3. Levantar el entorno de desarrollo
##npm run dev

# 4. Generar el build de producción
##npm run build
```

### 6.2 Cómo obtener las credenciales de Firebase

##1. Entra a [https://console.firebase.google.com](https://console.firebase.google.com)
   y crea un proyecto (o usa uno existente).
##2. En el menú lateral, ve a **Compilación > Authentication**, pestaña
   **Sign-in method**, y habilita el proveedor **Correo electrónico/contraseña**.
   Luego, en la pestaña **Users**, crea el usuario administrador
   (por ejemplo `admin@mimimarket.cl` con una contraseña).
##3. En el menú lateral, ve a **Compilación > Firestore Database** y crea
   la base de datos (modo producción).
##4. Ve a **Configuración del proyecto** (ícono de engranaje) > pestaña
   **General** > sección **Tus apps**. Si no existe una app web, créala
   con el ícono `</>`.
##5. Copia los valores del objeto `firebaseConfig` que te entrega Firebase
   y pégalos en tu archivo `.env` local (nunca en el código fuente):

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

##6. Sube las reglas de seguridad del archivo `firestore.rules` (incluido en
   este repositorio) desde **Firestore Database > Reglas**, o con
   `firebase deploy --only firestore:rules` si usas Firebase CLI.

### 6.3 Decisiones de arquitectura (para la demostración)

 **AuthContext en vanilla JS:** este proyecto no usa React, por lo que
  no existe un `AuthContext`/`Provider` literal. El archivo
  `assets/js/authContext.js` cumple el mismo rol: es la única fuente de
  verdad sobre la sesión, usando `onAuthStateChanged` de Firebase (nunca
  `localStorage`) y exponiendo el usuario actual al resto de las páginas.
 **Vite + variables de entorno:** como el proyecto original era HTML/JS
  sin build tool, se incorporó Vite para poder usar `.env` real
  (`import.meta.env.VITE_*`), módulos ES y el SDK de Firebase vía npm,
  manteniendo la misma estructura de páginas multi-HTML.
 **Colecciones de Firestore:**
   `productos` (antes `inventarioMimi` en localStorage)
  -`ventas` (antes `historialVentas`)
   `deudores` (antes `listaDeudores`)
   `clientes` (antes `directorioClientes`)
 **El carrito de compra (boleta en curso) no se migró a Firestore**
  porque es estado temporal de una venta en curso, no un dato de negocio
  persistente; se mantiene en memoria/`localStorage` del navegador como
  respaldo ante recargas accidentales, igual que un carrito de compras
  típico. El stock del producto sí se descuenta en Firestore apenas se
  agrega al carrito (y se devuelve si se elimina), para reflejar la
  reserva real de inventario.
 **Rutas protegidas:** `caja.html`, `inventario.html`, `deudores.html`
  e `historial.html` llaman a `protegerRuta()` al cargar, que valida el
  estado real de Firebase Auth y redirige a `login.html` si no hay sesión.
 **Reglas de seguridad:** ver `firestore.rules`. La regla mínima exige
  `request.auth != null` para leer o escribir cualquier colección.
