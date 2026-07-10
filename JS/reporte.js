const buscadorComponente = document.getElementById("buscador-componente");
const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const formulario = document.querySelector(".contenedor-fechas");
let historial = [];
cargarComponentes();


formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    historial = await obtenerLista("historial")
    const datos = new FormData(formulario);
  
    let camposValidos = validarCampos(datos);
  
    if(!camposValidos){
      return;
    }
    
    let fechaInicio = new Date(datos.get("fechaInicio"))
    fechaInicio.setDate(fechaInicio.getDate() + 1);

    let fechaFin = new Date(datos.get("fechaFin"))
    fechaFin.setDate(fechaFin.getDate() + 1);

    historial = historial.filter(historial => cambiarHoras(new Date(historial.fechaproduccion)) >= cambiarHoras(fechaInicio) && cambiarHoras(new Date(historial.fechaproduccion)) <= cambiarHoras(fechaFin))

    const tablaComponente = document.getElementById("tabla-componente");
    tablaComponente.setTabla(
        ["codigoproducto", "nombre", "cantidad", "fechaproduccion", "acciones"],
        historial,
        "historial"
    );

  });

function cambiarHoras(fecha){
    return fecha.setHours(0,0,0,0);
}

  function validarCampos(datos){
    let fechaInicio = new Date(datos.get("fechaInicio"))
    fechaInicio.setDate(fechaInicio.getDate() + 1);

    let fechaFin = new Date(datos.get("fechaFin"))
    fechaFin.setDate(fechaFin.getDate() + 1);

    if(fechaInicio > new Date || fechaFin > new Date){
        alert("¡No se permiten fechas Futuras!")
        return false;
    }

    if(fechaInicio > fechaFin){
        alert("¡La fecha inicio no puede ser despues de la fecha fin!")
        return false;
    }

    return true;
  }
document.addEventListener("DOMContentLoaded", () => {
    const sesionUsuario = sessionStorage.getItem("usuarioSesion");
    if (sesionUsuario == null) {
        window.location.href = "/index.html"
    }
})

async function cargarComponentes() {
    historial = await obtenerLista("historial");
    buscadorComponente.setBuscador(["CodigoProducto", "Nombre"]);
    const tablaComponente = document.getElementById("tabla-componente");
    tablaComponente.setTabla(
        ["codigoproducto", "nombre", "cantidad", "fechaproduccion", "acciones"],
        historial,
        "historial"
    );
    document.getElementById("btn-agregar").style.display = "none";
}

function cerrarSesion() {
    sessionStorage.clear();
}

buscadorComponente.addEventListener("keydown", async (evento) => {
    if (evento.key == "Enter") {
      const parametroBusqueda = document.getElementById("parametroBusqueda").value;
      const buscador = document.getElementById("buscador").value;
      if (parametroBusqueda == "default") {
        return;
      }
      historial = await obtenerLista("historial");
      let productoFiltrados = historial.filter(producto =>
        producto[parametroBusqueda].toLowerCase().startsWith(buscador.toLowerCase())
      )
  
      const tablaComponente = document.getElementById("tabla-componente");
      tablaComponente.setTabla(["codigoproducto", "nombre", "cantidad", "fechaproduccion", "acciones"], productoFiltrados, "historial");
    }
  })

  async function eliminarHistorial(codigo,indice) {
    historial = await obtenerLista("historial");
  
    for (let i = 0; i < historial.length; i++) {
  
      if (historial[i].codigoproducto == codigo) {
        historial.splice(indice, 1);
        break;
      }
    }
  
    await guardarLista("historial", historial);

    await cargarComponentes();
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