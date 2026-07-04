class tabla extends HTMLElement {
    constructor() {
        super();
        this.filas = [];
        this.columnas = [];
        this.tipo = "";
    }
    setTabla(columnas, filas, tipo) {
        this.columnas = columnas;
        this.filas = filas;
        this.tipo = tipo;
        this.crearTabla();
    }
    crearTabla() {
        let id = "";
        let columnasHtml = "";
        this.columnas.forEach(columna => {
            columnasHtml += `<th>${columna}</th>`
        })
        let filasHtml = "";

        this.filas.forEach(fila => {
            if (this.tipo == "usuario") {
                id = fila.cc;
            } else if (this.tipo == "producto") {
                id = fila.codigo;
            } else if (this.tipo == "receta") {
                id = fila.codigoProducto;
            }

            filasHtml += `<tr>`;

            for (let i = 0; i < this.columnas.length - 1; i++) {

                if (Array.isArray(fila[this.columnas[i]])) {

                    console.log(fila[this.columnas[i]].length)
                    filasHtml += `<td>`;

                    for (let j = 0; j < fila[this.columnas[i]].length; j++) {
                        filasHtml += `${fila[this.columnas[i]][j].nombre} (${fila[this.columnas[i]][j].cantidad}) `;
                    }

                    filasHtml += `</td>`;

                } else {

                    filasHtml += `<td>${fila[this.columnas[i]]}</td>`

                }
            }

            filasHtml += `<td style="display:flex; gap:5px;">
                            <button class="btn-accion btn-editar" onClick="editar('${id}')"><i class="bi bi-pencil"></i></button>
                            <button class="btn-accion btn-eliminar" onClick="eliminar('${id}')"><i class="bi bi-trash"></i></button>`;

            if (this.tipo == "producto") {
                if (fila.tipo != "Materia Prima") {
                    filasHtml += `<button class="btn-accion btn-producir" onClick="producir('${id}')"><i class="bi bi-box-seam"></i></button>`;
                }

            }
            filasHtml += `</td>`;
            filasHtml += `</tr>`;
        })


        this.innerHTML = `
            <table>
                <thead>
                    <tr>
                        ${columnasHtml}
                    </tr>
                </thead>
                <tbody>
                    ${filasHtml}
                </tbody>
            </table>
        `;
    }
}
class aside extends HTMLElement {

    constructor() {
        super()
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="cont-nav">
                <h2 class="logo">ACME</h2>
                <nav class="nav">
                    <a href="/usuarios.html">Usuario</a>
                    <a href="/inventario.html">Inventario</a>
                    <a href="/receta.html">Receta</a>
                    <a href="/index.html">Salir</a>
                </nav>
            </div>
        `;
    }
}

class buscador extends HTMLElement {
    constructor() {
        super()
        this.opciones = [];
    }

    setBuscador(opciones) {
        this.opciones = opciones;
        this.render();
    }
    render() {
        let opcionesHtml = "";

        this.opciones.forEach(opcion => {
            opcionesHtml += `<option value="${opcion.toLowerCase()}">${opcion}</option>`;
        })

        this.innerHTML = `
                <div class="barra-busqueda">
                    <div class="contenedor-buscador">
                        <input type="text" id="buscador" class="buscador" placeholder="Buscar...">
                        <i class="bi bi-search icon-buscar"></i>
                    </div>
                    <select id="parametroBusqueda">
                        <option value="default" selected disabled>Seleccionar</option>
                        ${opcionesHtml}

                    </select>
                    <button id = "btn-agregar" onClick = "mostrarModal()"><i class="bi bi-plus-lg"></i> Agregar</button>
                </div>
        `;
    }
}
customElements.define("mi-tabla", tabla)
customElements.define("barra-aside", aside)
customElements.define("buscador-componente", buscador)