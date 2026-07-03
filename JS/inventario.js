const buscadorComponente = document.getElementById("buscador-componente");
const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const modal = document.querySelector(".modal-overlay");
const selectorTipo = document.getElementById("tipo");
const formulario = document.querySelector(".modal-form");
let inventario = [];
let idProducto = null;
cargarComponentes();

async function cargarComponentes() {
  await obtenerInventario();
  buscadorComponente.setBuscador(["Codigo", "Nombre"]);
  const tablaComponente = document.getElementById("tabla-componente");
  tablaComponente.setTabla(
    ["codigo", "nombre", "proveedor", "stock", "tipo", "acciones"],
    inventario,
    "producto"
  );
}

selectorTipo.addEventListener("change", bloquearStock);

function bloquearStock() {
    const inputStock = document.getElementById("stock");

    if (selectorTipo.value == "Producto Elaborado") {
        inputStock.value = 0;
        inputStock.disabled = true;
        document.querySelector(".seccion-receta").classList.add("activo")
        cargarItemsReceta();
    } else {
        inputStock.disabled = false;
        document.querySelector(".seccion-receta").classList.remove("activo")
    }
}

async function cargarItemsReceta(){
    await obtenerInventario();
    let itemsHtml = "";
    for(let i = 0;i<inventario.length;i++){
        itemsHtml += `
            <div class="receta-item">
                <input type="checkbox" name="ingrediente-${i}" id="ingrediente-${i}">
                <label for="ingrediente-${i}">${inventario[i].nombre}</label>
                <input type="number" name="cantidad-${i}" id="cantidad-${i}" placeholder="0" min="0">
            </div>
        `;
    }
    const contReceta = document.querySelector(".receta-lista");
    contReceta.innerHTML = itemsHtml;
}

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await obtenerInventario();
    const datos = new FormData(formulario);

    let producto = crearProducto(datos);

    if (idProducto == null) {
        inventario.push(producto);
    } else {
        modificarListaInventario(producto);
    }

    await guardarInventario();

    ocultarModal();
    formulario.submit();
    idProducto = null;
});

function modificarListaInventario(producto) {
  for (let i = 0; i < inventario.length; i++) {
    if (inventario[i].codigo == idProducto) {
      inventario[i] = producto;
      break;
    }
  }
}

function crearProducto(datos) {
  let producto = {
    nombre: datos.get("nombre"),
    codigo: datos.get("codigo"),
    proveedor: datos.get("proveedor"),
    tipo: datos.get("tipo"),
    stock: document.getElementById("stock").value,
  };
  return producto;
}

function editar(id) {
  mostrarModal();
  completarFormulario(id);
  bloquearStock();
  idProducto = id;
}

async function eliminar(id) {
  let posicionEliminar = null;
  for (let i = 0; i < inventario.length; i++) {
    if (inventario[i].codigo == id) {
      posicionEliminar = i;
    }
  }

  inventario.splice(posicionEliminar, 1);
  await guardarInventario();
  await cargarComponentes();
}

function completarFormulario(id) {
  const nombre = document.getElementById("nombre");
  const codigo = document.getElementById("codigo");
  const tipo = document.getElementById("tipo");
  const proveedor = document.getElementById("proveedor");
  const stock = document.getElementById("stock");

  inventario.forEach((producto) => {
    if (producto.codigo == id) {
      nombre.value = producto.nombre;
      codigo.value = producto.codigo;
      tipo.value = producto.tipo;
      proveedor.value = producto.proveedor;
      stock.value = producto.stock;
    }
  });
}

function ocultarModal() {
  document.querySelector(".modal-overlay").style.display = "none";
}
function mostrarModal() {
  document.querySelector(".modal-overlay").style.display = "flex";
}
modal.addEventListener("click", (ev) => {
  if (ev.target == modal) {
    ocultarModal();
    formulario.reset();
  }
});

async function obtenerInventario() {
  const response = await fetch(`${API_URL}/inventario.json`);
  inventario = await response.json();
  if (inventario == null) {
    inventario = [];
  }
}

async function guardarInventario() {
  await fetch(`${API_URL}/inventario.json`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(inventario),
  });
}
