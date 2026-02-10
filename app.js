// Configurar base de datos local
// 1. Configurar Base de Datos con más tablas
const db = new Dexie("VentasDB");
db.version(2).stores({ // Subimos a versión 2
    usuarios: "++id, nombre, user, pass",
    productos: "++id, nombre, precio, stock",
    facturas: "++id, cliente, fecha, total, vendedor, items"
});

// 2. Agregar algunos productos de prueba si no hay ninguno
db.on("ready", async () => {
    const pCount = await db.productos.count();
    if (pCount === 0) {
        await db.productos.bulkAdd([
            { nombre: "Coca Cola 1.5L", precio: 2.50, stock: 50 },
            { nombre: "Pan Molde", precio: 1.80, stock: 20 },
            { nombre: "Leche Entera", precio: 1.20, stock: 30 }
        ]);
    }
    // (Mantén aquí el código de los vendedores que ya tenías)
});

// Crear los 5 vendedores si la base de datos está vacía
db.on("ready", async () => {
    const count = await db.usuarios.count();
    if (count === 0) {
        await db.usuarios.bulkAdd([
            { nombre: "Vendedor 1", user: "admin1", pass: "1234" },
            { nombre: "Vendedor 2", user: "admin2", pass: "1234" },
            { nombre: "Vendedor 3", user: "admin3", pass: "1234" },
            { nombre: "Vendedor 4", user: "admin4", pass: "1234" },
            { nombre: "Vendedor 5", user: "admin5", pass: "1234" }
        ]);
    }
});
db.open();

// Función de Login
async function intentarLogin() {
    const u = document.getElementById('user').value;
    const p = document.getElementById('pass').value;

    const userFound = await db.usuarios.where({ user: u, pass: p }).first();

    if (userFound) {
        document.getElementById('view-login').classList.add('hidden');
        document.getElementById('view-menu').classList.remove('hidden');
        document.getElementById('vendedor-name').innerText = userFound.nombre;
    } else {
        document.getElementById('error-msg').classList.remove('hidden');
    }
}

function cerrarSesion() {
    location.reload(); // Reinicia la app
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

let carrito = [];

function irAFactura() {
    document.getElementById('view-menu').classList.add('hidden');
    document.getElementById('view-factura').classList.remove('hidden');
}

function irAMenu() {
    document.getElementById('view-factura').classList.add('hidden');
    document.getElementById('view-menu').classList.remove('hidden');
}

async function buscarProductos() {
    const query = document.getElementById('buscar-producto').value.toLowerCase();
    const lista = document.getElementById('lista-busqueda');
    lista.innerHTML = "";

    if (query.length < 2) return;

    const productos = await db.productos
        .filter(p => p.nombre.toLowerCase().includes(query))
        .toArray();

    productos.forEach(p => {
        const item = document.createElement('div');
        item.className = "p-3 border-b hover:bg-gray-100 cursor-pointer flex justify-between";
        item.innerHTML = `<span>${p.nombre}</span> <b>$${p.precio.toFixed(2)}</b>`;
        item.onclick = () => agregarAlCarrito(p);
        lista.appendChild(item);
    });
}

function agregarAlCarrito(producto) {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarVistaCarrito();
    document.getElementById('lista-busqueda').innerHTML = "";
    document.getElementById('buscar-producto').value = "";
}

function actualizarVistaCarrito() {
    const lista = document.getElementById('carrito-lista');
    let total = 0;
    lista.innerHTML = "";

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        lista.innerHTML += `
            <li class="py-2 flex justify-between items-center">
                <div>
                    <p class="font-semibold">${item.nombre}</p>
                    <small>${item.cantidad} x $${item.precio.toFixed(2)}</small>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold">$${subtotal.toFixed(2)}</span>
                    <button onclick="eliminarDelCarrito(${index})" class="text-red-500 text-xl">×</button>
                </div>
            </li>`;
    });
    document.getElementById('total-factura').innerText = total.toFixed(2);
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarVistaCarrito();
}