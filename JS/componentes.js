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
            if(this.tipo == "usuario"){
                id = fila.CC;
            }else if(this.tipo == "producto"){
                id = fila.Codigo;
            }else{
                id = fila.id;
            }
            filasHtml += `<tr>`;

            for (let i = 0; i < this.columnas.length - 1; i++) {
                filasHtml += `<td>${fila[this.columnas[i]]}</td>`

            }

            filasHtml += `<td style="display:flex; gap:5px;">
                            <button class="btn-accion btn-editar" onClick="editar('${id}')"><i class="bi bi-pencil"></i></button>
                            <button class="btn-accion btn-eliminar" onClick="eliminar('${id}')"><i class="bi bi-trash"></i></button>`;

            if (this.tipo == "producto") {
                filasHtml += `<button class="btn-accion btn-producir" onClick="producir('${id}')"><i class="bi bi-box-seam"></i></button>`;
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
customElements.define("mi-tabla", tabla)