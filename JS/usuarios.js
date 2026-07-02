const tablaComponente = document.getElementById("tabla-componente");
const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
let usuarios = [];
async function cargarTabla() {

  const response = await fetch(`${API_URL}/user/usuarios.json`, {
    method: "GET",
  });
  usuarios = await response.json();

  tablaComponente.setTabla(["cc", "nombre", "cargo","Acciones"], usuarios);
}
cargarTabla();
