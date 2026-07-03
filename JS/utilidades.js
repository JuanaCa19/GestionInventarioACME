const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";

export async function obtenerLista(entidad) {
    let lista = []
    const response = await fetch(`${API_URL}/${entidad}.json`);
    lista = await response.json();
    if (lista == null) {
        lista = [];
    }
    return lista;
}

export async function guardarLista(entidad,lista) {
    await fetch(`${API_URL}/${entidad}.json`, {
        method: "PUT",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify(lista),
    });
}
