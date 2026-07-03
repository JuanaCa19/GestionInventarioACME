const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const buscadorComponente = document.getElementById("buscador-componente");
const modal = document.querySelector(".modal-overlay");
const formulario = document.querySelector(".modal-form");
const selectProductos = document.getElementById("materiales");
const btnMateriales = document.getElementById("btn-materiales");
let recetas = [];
let inventario = [];
let listaMateriales = [];
cargarComponentes();

document.querySelector(".btn-cancelar").addEventListener("click",ocultarModal);

async function cargarComponentes() {

  recetas = await obtenerLista("receta");

  buscadorComponente.setBuscador(["Codigo", "Nombre"]);
  document.getElementById("btn-agregar").addEventListener("click",mostrarModal);

  const tablaComponente = document.getElementById("tabla-componente");

  tablaComponente.setTabla(
    ["Nombre", "Codigo", "Materiales","acciones"],
    recetas,
    "receta"
  );
}

function ocultarModal(){
  document.querySelector('.modal-overlay').style.display = 'none';
}
function mostrarModal(){
  document.querySelector('.modal-overlay').style.display = 'flex';
  cargarProductosSelect();
}

modal.addEventListener("click",(ev)=>{
  if(ev.target == modal){
    ocultarModal();
    formulario.reset();
  }
})

async function cargarProductosSelect(){
    inventario = await obtenerLista("inventario");

    let opciones = "";

    inventario.forEach(producto => {
        opciones += `
            <option value="${producto.codigo}">${producto.nombre}</option>
        `;    
    });

    selectProductos.innerHTML += opciones;
}

btnMateriales.addEventListener("click", async ()=>{
    const contMateriales = document.getElementById("cont-receta-items");
    let codigoProducto = selectProductos.value;
    let itemHtml = "";
    inventario = await obtenerLista("inventario");

    inventario.forEach(producto=>{
        if(producto.codigo == codigoProducto){
            itemHtml = `
                <span class="cont-material">
                    ${producto.nombre}
                    <button type="button" class="btn-eliminar-item" onClick = "eliminarItem('${producto.codigo}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </span>
            `;
        }
    })
    contMateriales.style.display = 'flex';
    contMateriales.innerHTML += itemHtml;
})

async function obtenerLista(entidad) {
    let lista = []
    const response = await fetch(`${API_URL}/${entidad}.json`);
    lista = await response.json();
    if (lista == null) {
        lista = [];
    }
    return lista;
}

async function guardarLista(entidad,lista) {
    await fetch(`${API_URL}/${entidad}.json`, {
        method: "PUT",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(lista),
    });
}