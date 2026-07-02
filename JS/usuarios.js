const tablaComponente = document.getElementById("tabla-componente");
const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const modal = document.querySelector('.modal-overlay');
const formulario = document.querySelector(".modal-form");
let usuarios = [];
let idUsuario = null;
cargarTabla();

modal.addEventListener("click",(ev)=>{
  if(ev.target == modal){
    ocultarModal();
  }
})

async function cargarTabla() {
  await obtenerUsuarios();
  tablaComponente.setTabla(["CC", "Nombre", "Cargo","Acciones"], usuarios,"usuario");
}


formulario.addEventListener("submit", async (evento) =>{
  evento.preventDefault();
  await obtenerUsuarios();
  const datos = new FormData(formulario);

  if(datos.get("password") != datos.get("passwordRep")){
    alert("Contraseñas no coinciden!")
    return;
  }

  let usuario = crearUsuario(datos);

  if(idUsuario == null){
    usuarios.push(usuario);
  }else{
    modificarListaUsuarios(usuario)
  }
  

  await guardarUsuarios();

  ocultarModal();
  formulario.submit();
  idUsuario = null;
});

function modificarListaUsuarios(usuario){
  for(let i = 0; i < usuarios.length; i++){
    if(usuarios[i].CC == idUsuario){
      usuarios[i] = usuario;
      break;
    }
  }
}

function crearUsuario(datos){
  let usuario = {
    Nombre:datos.get("nombre"),
    CC:datos.get("identificacion"),
    Cargo:datos.get("cargo"),
    Contraseña:datos.get("password")
  }
  return usuario;
}
function ocultarModal(){
  document.querySelector('.modal-overlay').style.display = 'none';
}
function mostrarModal(){
  document.querySelector('.modal-overlay').style.display = 'flex';
}

function editar(id){
  mostrarModal();
  completarFormulario(id);
  idUsuario = id;
}

async function eliminar(id){
  let posicionEliminar = null;
  console.log(posicionEliminar)
  for(let i = 0; i < usuarios.length; i++){
    if(usuarios[i].CC == id){
      posicionEliminar = i;
    }
  }
  console.log(posicionEliminar)
  usuarios.splice(posicionEliminar,1);
  await guardarUsuarios();
  await cargarTabla();
}

function completarFormulario(id){
  const nombre = document.getElementById("nombre");
  const identificacion = document.getElementById("identificacion");
  const cargo = document.getElementById("cargo");
  const password = document.getElementById("password");
  const passwordRep = document.getElementById("passwordRep");

  usuarios.forEach(usuario =>{
    if(usuario.CC == id){
      nombre.value = usuario.Nombre;
      identificacion.value = usuario.CC;
      cargo.value = usuario.Cargo;
      password.value = usuario.Contraseña
      passwordRep.value = usuario.Contraseña
    }
  });
}













async function obtenerUsuarios() {
  const response = await fetch(`${API_URL}/user/usuarios.json`);
  usuarios = await response.json();
}

async function guardarUsuarios() {
  await fetch(`${API_URL}/user/usuarios.json`,{
    method: "PUT",
    headers: {
      "Content-type" : "application/json"
    },
    body: JSON.stringify(usuarios)
  });
}