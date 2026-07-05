const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const buscadorComponente = document.getElementById("buscador-componente");
const tablaComponente = document.getElementById("tabla-componente");
const modal = document.querySelector(".modal-overlay");
const formulario = document.querySelector(".modal-form");
const selectProductos = document.getElementById("materiales");
const btnMateriales = document.getElementById("btn-materiales");
let recetas = [];
let inventario = [];
let listaMateriales = [];
let idReceta = null;
cargarComponentes();

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

    recetas = await obtenerLista("receta");

    let recetasFiltradas = recetas.filter(producto =>
      producto[parametroBusqueda].toLowerCase().startsWith(buscador.toLowerCase())
    )


    tablaComponente.setTabla(
      ["nombre", "codigoproducto", "materiales", "acciones"],
      recetasFiltradas,
      "receta"
    );
  }
})

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    recetas = await obtenerLista("receta");
    const datos = new FormData(formulario);

    eliminarDuplicados();
    let receta = crearReceta(datos);

    if (idReceta == null) {
        recetas.push(receta)
    } else {
        modificarListaReceta(receta)
    }

    await guardarLista("receta", recetas);

    ocultarModal();
    await cargarComponentes();
    idReceta = null;
});

function modificarListaReceta(receta) {
    for (let i = 0; i < recetas.length; i++) {
        if (recetas[i].codigoproducto == idReceta) {
            recetas[i] = receta;
            break;
        }
    }
}

function crearReceta(datos) {
    let receta = {
        nombre: datos.get("nombre"),
        codigoproducto: datos.get("producto"),
        materiales: listaMateriales,
    }
    return receta;
}

function eliminarDuplicados() {
    for (let i = 0; i < listaMateriales.length; i++) {
        for (let j = i + 1; j < listaMateriales.length; j++) {
            if (listaMateriales[i].codigo == listaMateriales[j].codigo) {
                listaMateriales[i].cantidad += listaMateriales[j].cantidad
                listaMateriales.splice(j, 1);
                j--;
            }
        }
    }
}
async function cargarComponentes() {

    recetas = await obtenerLista("receta");

    buscadorComponente.setBuscador(["CodigoProducto", "Nombre"]);
    document.getElementById("btn-agregar").addEventListener("click", cargarProductosSelect);

    const tablaComponente = document.getElementById("tabla-componente");

    tablaComponente.setTabla(
        ["nombre", "codigoproducto", "materiales", "acciones"],
        recetas,
        "receta"
    );
}

function ocultarModal() {
    document.querySelector('.modal-overlay').style.display = 'none';
    limpiarMateriales();
}
function mostrarModal() {
    document.querySelector('.modal-overlay').style.display = 'flex';

}
function limpiarMateriales() {
    const contMateriales = document.getElementById("cont-receta-items");
    contMateriales.innerHTML = "";
    contMateriales.style.display = 'none';
    listaMateriales = [];
}
modal.addEventListener("click", (ev) => {
    if (ev.target == modal) {
        ocultarModal();
        formulario.reset();
    }
})

async function cargarProductosSelect() {
    const selectProducto = document.getElementById("producto");
    inventario = await obtenerLista("inventario");

    let opcionesProductoElaborado = `<option value="" selected disabled>Seleccionar</option>`;

    recetas = await obtenerLista("receta");
    inventario.forEach(producto => {
        if (producto.tipo == "Producto Elaborado" && verificarReceta(producto.codigo)) {
            opcionesProductoElaborado += `
                <option value="${producto.codigo}">${producto.nombre}</option>
            `;
        }

    });

    selectProducto.innerHTML = opcionesProductoElaborado;
    cargarMaterialesSelect();
}

function cargarMaterialesSelect() {

    let opciones = `<option value="" selected disabled>Seleccionar</option>`;

    inventario.forEach(producto => {
        opciones += `
            <option value="${producto.codigo}">${producto.nombre}</option>
        `;

    });

    selectProductos.innerHTML = opciones;
}

function verificarReceta(codigoProducto) {
    for (let i = 0; i < recetas.length; i++) {
        if (recetas[i].codigoproducto == codigoProducto) {
            return false;
        }
    }
    return true;
}

btnMateriales.addEventListener("click", async () => {

    const cantidad = document.getElementById("cantidad").value;
    let codigoProducto = selectProductos.value;

    inventario = await obtenerLista("inventario");

    cargarMaterialesSeleccionados(codigoProducto, cantidad);
    insertarMaterialesSeleccionados()

})

function cargarMaterialesSeleccionados(codigoProducto, cantidad) {


    inventario.forEach(producto => {
        if (producto.codigo == codigoProducto) {
            let productoSeleccionado = {
                codigo: codigoProducto,
                nombre: producto.nombre,
                cantidad: Number(cantidad)
            }
            listaMateriales.push(productoSeleccionado);
        }
    })


}

function insertarMaterialesSeleccionados() {
    const contMateriales = document.getElementById("cont-receta-items");
    let itemHtml = "";

    for (let i = 0; i < listaMateriales.length; i++) {
        itemHtml += `
                <span class="cont-material">
                    ${listaMateriales[i].nombre}
                    <button type="button" class="btn-eliminar-item" onClick = "eliminarItem('${listaMateriales[i].codigo}',${i})">
                        <i class="bi bi-trash"></i>
                    </button>
                </span>
            `;
    }

    contMateriales.style.display = 'flex';
    contMateriales.innerHTML = itemHtml;
}

function eliminarItem(codigo, posicion) {
    const contMateriales = document.getElementById("cont-receta-items");

    for (let i = 0; i < listaMateriales.length; i++) {
        if (listaMateriales[i].codigo == codigo && posicion == i) {
            listaMateriales.splice(i, 1);
        }
    }

    contMateriales.innerHTML = "";
    insertarMaterialesSeleccionados();
}


async function editar(id) {
    mostrarModal();
    recetas = await obtenerLista("receta");
    inventario = await obtenerLista("inventario");
    completarFormulario(id);

    idReceta = id;
}

async function eliminar(id) {
    recetas = await obtenerLista("receta");
    let posicionEliminar = null;
    for (let i = 0; i < recetas.length; i++) {
        if (recetas[i].codigoproducto == id) {
            posicionEliminar = i;
        }
    }
    if (posicionEliminar == null) {
        return;
    }
    recetas.splice(posicionEliminar, 1);
    await guardarLista("receta", recetas);
    await cargarComponentes();
}

function completarFormulario(id) {
    const nombre = document.getElementById("nombre");
    const codigo = document.getElementById("producto");


    recetas.forEach((receta) => {
        if (receta.codigoproducto == id) {
            nombre.value = receta.nombre;
            listaMateriales = receta.materiales;
        }
    });

    inventario.forEach(producto => {
        if (producto.codigo == id) {
            codigo.innerHTML = `<option value="${producto.codigo}">${producto.nombre}</option>`;
            codigo.value = producto.codigo;
        }
    })

    cargarMaterialesSelect();
    insertarMaterialesSeleccionados();
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