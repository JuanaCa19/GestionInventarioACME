const API_URL = "https://stock-flow-b661f-default-rtdb.firebaseio.com";
const formLogin = document.getElementById("form-login");
let usuarios = [];

formLogin.addEventListener("submit",async (ev)=>{
    ev.preventDefault();

    const cc = document.getElementById("usuario");
    const password = document.getElementById("password");

    await obtenerUsuarios();

    for(let i = 0; i< usuarios.length;i++){
        if(usuarios[i].cc == cc.value && usuarios[i].password == password.value){
            guardarSesion();
            window.location.href = "usuarios.html"
            return;
        }
    }
    alert("Credenciales Incorrectas")
});

async function obtenerUsuarios(){
    const response = await fetch(`${API_URL}/user/usuarios.json`,{
        method:"GET",
        headers:{
            "Content-Type":"application/json"
        }
    });

    usuarios = await response.json();

} 

function guardarSesion(){

}
