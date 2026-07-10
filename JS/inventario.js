const buscadorComponente = document.getElementById("buscador-componente");
const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const modal = document.querySelector(".modal-overlay");
const selectorTipo = document.getElementById("tipo");
const formulario = document.querySelector(".modal-form");
let inventario = [];
let historial = [];
let recetas = []
let idProducto = null;
cargarComponentes();

document.addEventListener("DOMContentLoaded", () => {
  const sesionUsuario = sessionStorage.getItem("usuarioSesion");
  if (sesionUsuario == null) {
    window.location.href = "/index.html"
  }
})

async function cargarComponentes() {
  inventario = await obtenerLista("inventario");
  buscadorComponente.setBuscador(["Codigo", "Nombre"]);
  const tablaComponente = document.getElementById("tabla-componente");
  tablaComponente.setTabla(
    ["codigo", "nombre", "proveedor", "stock", "tipo", "acciones"],
    inventario,
    "producto"
  );
}

function cerrarSesion() {
  sessionStorage.clear();
}

buscadorComponente.addEventListener("keydown", (evento) => {
  if (evento.key == "Enter") {
    const parametroBusqueda = document.getElementById("parametroBusqueda").value;
    const buscador = document.getElementById("buscador").value;
    if (parametroBusqueda == "default") {
      return;
    }
    let inventarioFiltrado = inventario.filter(producto =>
      producto[parametroBusqueda].toLowerCase().startsWith(buscador.toLowerCase())
    )

    const tablaComponente = document.getElementById("tabla-componente");
    tablaComponente.setTabla(
      ["codigo", "nombre", "proveedor", "stock", "tipo", "acciones"],
      inventarioFiltrado,
      "producto"
    );
  }
})
selectorTipo.addEventListener("change", bloquearStock);

async function producir(codigo) {
  let materiales = await verificarReceta(codigo);

  if (materiales == null) {

    alert("Este producto no tiene una receta configurada. Ve a la sección de Recetas para crear una antes de producir.");

    return;

  }

  const cantidadProducir = Number(prompt("¿Cuántas unidades deseas producir?", "1"));
  if (!cantidadProducir || cantidadProducir <= 0) {
    alert("Ingresa una cantidad válida mayor a 0 para producir.");
    return;
  }

  inventario = await obtenerLista("inventario");

  for (let material of materiales) {
    let stockValido = await verificarStock(material.codigo, material.cantidad * cantidadProducir);
    if (!stockValido) {
      alert(`No puedes producir ${cantidadProducir} unidad(es): necesitas ${material.cantidad * cantidadProducir} de "${material.nombre}" y solo tienes disponible menos que eso.`);
      return;
    }
  }



  modificarInventario(codigo, materiales, cantidadProducir);
  await guardarLista("inventario", inventario);

  historial = await obtenerLista("historial");
  historial.push(crearHistorial(codigo, cantidadProducir));
  await guardarLista("historial", historial);

  await cargarComponentes();
}

function modificarInventario(codigo, materiales, cantidadProducir) {
  inventario.forEach(producto => {
    materiales.forEach(material => {
      if (material.codigo == producto.codigo) {
        producto.stock -= material.cantidad * cantidadProducir;
      }
    })
    if (producto.codigo == codigo) {
      producto.stock += cantidadProducir;
    }
  })

}

async function verificarStock(codigo, cantidad) {

  for (let i = 0; i < inventario.length; i++) {

    if (inventario[i].codigo == codigo && cantidad <= inventario[i].stock) {

      return true;
    }
  }

  return false;
}

async function verificarReceta(codigo) {

  recetas = await obtenerLista("receta");

  for (let i = 0; i < recetas.length; i++) {

    if (recetas[i].codigoproducto == codigo) {

      return recetas[i].materiales;
    }

  }

  return null;
}

function bloquearStock() {
  const inputStock = document.getElementById("stock");

  if (selectorTipo.value == "Producto Elaborado") {
    inputStock.value = 0;
    inputStock.disabled = true;

  } else {
    inputStock.disabled = false;

  }
}



formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  inventario = await obtenerLista("inventario");
  const datos = new FormData(formulario);

  let camposValidos = validarCampos(datos);

  if (!camposValidos) {
    alert("No se permiten campos vacios");
    return;
  }

  if (validarCodigo(datos)) {
    alert(`¡Ya existe un producto con esta codigo!: ${datos.get("codigo").trim()}`)
    return;
  }

  let producto = crearProducto(datos);

  if (idProducto == null) {
    inventario.push(producto);
  } else {
    modificarListaInventario(producto);
  }

  await guardarLista("inventario", inventario);

  ocultarModal();
  await cargarComponentes();
  idProducto = null;
});

function validarCodigo(datos) {
  return inventario.some(producto => producto.codigo == datos.get("codigo").trim() && producto.codigo != idProducto);
}

function validarCampos(datos) {
  if (datos.get("nombre").trim() === "" || datos.get("codigo").trim() === "" || datos.get("proveedor").trim() === "") {
    return false;
  }
  return true;
}

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
    nombre: datos.get("nombre").trim(),
    codigo: datos.get("codigo").trim(),
    proveedor: datos.get("proveedor").trim(),
    tipo: datos.get("tipo"),
    stock: Number(document.getElementById("stock").value)
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
  let existeProducto = await verificarExistenciaReceta(id)

  if (existeProducto) {
    return;
  }

  let posicionEliminar = null;

  for (let i = 0; i < inventario.length; i++) {
    if (inventario[i].codigo == id) {
      posicionEliminar = i;
    }
  }

  if (posicionEliminar == null) {
    return;
  }

  inventario.splice(posicionEliminar, 1);
  await guardarLista("inventario", inventario);
  await cargarComponentes();
}

async function verificarExistenciaReceta(id) {

  recetas = await obtenerLista("receta");

  for (let receta of recetas) {
    if (receta.codigoproducto == id) {
      alert(`No puedes eliminar este producto porque tiene una receta asociada. Elimina primero la receta desde la sección Recetas.`);
      return true;
    }

    if (receta.materiales != undefined) {
      for (let material of receta.materiales) {
        if (material.codigo == id) {
          alert(`No puedes eliminar este material porque se usa en la receta de "${receta.nombre}". Quítalo de esa receta antes de eliminarlo del inventario.`);
          return true;
        }
      }
    }
  }

  return false;
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
  formulario.reset();
}
function mostrarModal() {
  document.querySelector(".modal-overlay").style.display = "flex";
}

modal.addEventListener("click", (ev) => {
  if (ev.target == modal) {
    ocultarModal();
    idProducto = null;
  }
});

function crearHistorial(codigoproducto, cantidad) {
  let nombreProducto = "";

  for (producto of inventario) {
    if (producto.codigo == codigoproducto) {
      nombreProducto = producto.nombre;
    }
  }

  let historial = {
    codigoproducto: codigoproducto,
    nombre: nombreProducto,
    cantidad: cantidad,
    fechaproduccion: new Date()
  }
  return historial;
}

async function verHistorialProducto(codigo) {

  historial = await obtenerLista("historial");

  historial = historial.filter(historial => historial.codigoproducto == codigo);

  if (historial.length == 0) {
    alert("¡El producto no tiene un historial de Producción!")
    return;
  }

  cargarTablaHistorial()

}

function cargarTablaHistorial() {
  buscadorComponente.setBuscador(["CodigoProducto", "Codigo"]);
  const tablaComponente = document.getElementById("tabla-componente");
  tablaComponente.setTabla(
    ["codigoproducto","nombre", "cantidad", "fechaproduccion", "acciones"],
    historial,
    "historial"
  );
  document.getElementById("btn-agregar").style.display = "none";
}

async function eliminarHistorial(codigo,indice) {
  historial = await obtenerLista("historial");

  for (let i = 0; i < historial.length; i++) {

    if (historial[i].codigoproducto == codigo) {
      historial.splice(indice, 1);
      break;
    }
  }

  await guardarLista("historial", historial);

  historial = await obtenerLista("historial");
  historial = historial.filter(historial => historial.codigoproducto == codigo);
  cargarTablaHistorial();

}
async function obtenerLista(entidad) {
  let lista = []
  const response = await fetch(`${API_URL}/${entidad}.json`);
  lista = await response.json();
  if (lista == null) {
    lista = [];
  }
  return lista;
}

async function guardarLista(entidad, lista) {
  await fetch(`${API_URL}/${entidad}.json`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(lista),
  });
}
