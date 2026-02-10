// Configurar base de datos local
const db = new Dexie("VentasDB");
db.version(1).stores({
    usuarios: "++id, nombre, user, pass"
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