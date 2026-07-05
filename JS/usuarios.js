const buscadorComponente = document.getElementById("buscador-componente");
const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const modal = document.querySelector('.modal-overlay');
const formulario = document.querySelector(".modal-form");
let usuarios = [];
let idUsuario = null;
cargarTabla();

modal.addEventListener("click", (ev) => {
  if (ev.target == modal) {
    ocultarModal();
    formulario.reset();
    idUsuario = null;
  }
})
document.addEventListener("DOMContentLoaded", () => {
  const sesionUsuario = sessionStorage.getItem("usuarioSesion");
  if (sesionUsuario == null) {
    window.location.href = "/index.html"
  }
})

function cerrarSesion(){
    sessionStorage.clear();
}

buscadorComponente.addEventListener("keydown", async (evento) => {
  if (evento.key == "Enter") {
    const parametroBusqueda = document.getElementById("parametroBusqueda").value;
    const buscador = document.getElementById("buscador").value;
    if (parametroBusqueda == "default") {
      return;
    }
    await obtenerUsuarios();
    let usuariosFiltrados = usuarios.filter(usuario =>
      usuario[parametroBusqueda].toLowerCase().startsWith(buscador.toLowerCase())
    )

    const tablaComponente = document.getElementById("tabla-componente");
    tablaComponente.setTabla(["cc", "nombre", "cargo", "Acciones"], usuariosFiltrados, "usuario");
  }
})

async function cargarTabla() {
  await obtenerUsuarios();
  buscadorComponente.setBuscador(["Nombre", "CC"]);
  const tablaComponente = document.getElementById("tabla-componente");
  tablaComponente.setTabla(["cc", "nombre", "cargo", "Acciones"], usuarios, "usuario");
}


formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  await obtenerUsuarios();
  const datos = new FormData(formulario);

  if (datos.get("password") != datos.get("passwordRep")) {
    alert("Contraseñas no coinciden!")
    return;
  }

  let usuario = crearUsuario(datos);

  if (idUsuario == null) {
    usuarios.push(usuario);
  } else {
    modificarListaUsuarios(usuario)
  }


  await guardarUsuarios();

  ocultarModal();
  await cargarTabla()
  idUsuario = null;
});


function modificarListaUsuarios(usuario) {
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].cc == idUsuario) {
      usuarios[i] = usuario;
      break;
    }
  }
}

function crearUsuario(datos) {
  let usuario = {
    nombre: datos.get("nombre"),
    cc: datos.get("identificacion"),
    cargo: datos.get("cargo"),
    contraseña: datos.get("password")
  }
  return usuario;
}
function ocultarModal() {
  document.querySelector('.modal-overlay').style.display = 'none';
}
function mostrarModal() {
  document.querySelector('.modal-overlay').style.display = 'flex';
}

function editar(id) {
  mostrarModal();
  completarFormulario(id);
  idUsuario = id;
}

async function eliminar(id) {
  let posicionEliminar = null;
  for (let i = 0; i < usuarios.length; i++) {
    if (usuarios[i].cc == id) {
      posicionEliminar = i;
    }
  }
  if (posicionEliminar == null) return;
  usuarios.splice(posicionEliminar, 1);
  await guardarUsuarios();
  await cargarTabla();
}

function completarFormulario(id) {
  const nombre = document.getElementById("nombre");
  const identificacion = document.getElementById("identificacion");
  const cargo = document.getElementById("cargo");
  const password = document.getElementById("password");
  const passwordRep = document.getElementById("passwordRep");

  usuarios.forEach(usuario => {
    if (usuario.cc == id) {
      nombre.value = usuario.nombre;
      identificacion.value = usuario.cc;
      cargo.value = usuario.cargo;
      password.value = usuario.contraseña;
      passwordRep.value = usuario.contraseña;
    }
  });
}












async function obtenerUsuarios() {
  const response = await fetch(`${API_URL}/user/usuarios.json`);
  usuarios = await response.json();
  if (usuarios == null) {
    usuarios = [];
  }
  return usuarios;
}

async function guardarUsuarios() {
  await fetch(`${API_URL}/user/usuarios.json`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json"
    },
    body: JSON.stringify(usuarios)
  });
}