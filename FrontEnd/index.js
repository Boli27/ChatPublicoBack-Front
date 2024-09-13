let nombreUsuario = "";
// Solicita al usuario que ingrese un nombre de usuario válido
while (!nombreUsuario) {
  nombreUsuario = prompt("Ingresa el usuario:");
  if (!nombreUsuario || nombreUsuario.trim() === "") {
    alert("El nombre de usuario no puede estar vacío. Por favor, ingrese un nombre válido.");
    nombreUsuario = "";
  }
}

const socket = new WebSocket("ws://localhost:8080"); // Crea una conexión WebSocket al servidor

const chat = document.getElementById("chat"); // Elemento donde se mostrarán los mensajes
const input = document.getElementById("mensaje"); // Campo de entrada de texto para nuevos mensajes
const button = document.getElementById("enviar"); // Botón para enviar un mensaje
document.getElementById("UserName").innerText = "Usuario: " + nombreUsuario + " conectado"; // Muestra el nombre del usuario

let userId; // Variable para almacenar el ID del usuario

// Función para obtener la hora actual en formato UTC
function obtenerHoraUTC() {
  const now = new Date();
  return now.toISOString();
}

// Función para convertir la hora UTC a la hora local
function convertirHoraLocal(horaUTC) {
  const fecha = new Date(horaUTC);
  return fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Evento que se dispara cuando la conexión WebSocket se abre
socket.addEventListener("open", () => {
  // Envía el nombre de usuario al servidor cuando se conecta
  socket.send(JSON.stringify({ type: 'name', name: nombreUsuario }));
});

// Evento que se dispara cuando se recibe un mensaje del servidor
socket.onmessage = (event) => {
  const data = JSON.parse(event.data); // Parseo del mensaje recibido desde el servidor
  const nuevoMensaje = document.createElement("div"); // Crea un nuevo elemento para el mensaje

  if (data.type === 'name') {
    // Guarda el ID del usuario cuando el servidor lo envía
    userId = data.id;
    console.log(userId);
  } else if (data.type === 'message') {
    const horaLocal = convertirHoraLocal(data.time); // Convierte la hora del mensaje a la hora local
    nuevoMensaje.classList.add("mensaje"); // Agrega la clase 'mensaje' al nuevo elemento

    // Aplica diferentes clases según el ID del remitente
    if (data.userId === userId) {
      nuevoMensaje.classList.add("mensaje-propio"); // Mensaje propio
    } else {
      nuevoMensaje.classList.add("mensaje-otro"); // Mensaje de otro usuario
    }

    // Inserta el contenido HTML del mensaje
    nuevoMensaje.innerHTML = `
        <div class="usuario">${data.name}</div>
        <div class="texto">${data.message}</div>
        <div class="hora">${horaLocal}</div>
      `;
  } else if (data.type === 'notification') {
    // Maneja notificaciones de entrada y salida de usuarios
    nuevoMensaje.textContent = data.message;
    nuevoMensaje.classList.add("mensaje", "mensaje-otro");
    nuevoMensaje.style.fontStyle = 'italic';
  }

  chat.appendChild(nuevoMensaje); // Agrega el nuevo mensaje al área de chat
  chat.scrollTop = chat.scrollHeight; // Desplaza el área de chat al final para mostrar el nuevo mensaje
};

// Evento que se dispara cuando se hace clic en el botón de envío
button.addEventListener("click", () => {
  const mensaje = input.value; // Obtiene el mensaje del campo de entrada
  if (mensaje.trim() !== "") {
    const horaUTC = obtenerHoraUTC(); // Obtiene la hora actual en UTC
    // Envía el mensaje al servidor
    socket.send(JSON.stringify({
      type: 'message',
      message: mensaje,
      time: horaUTC
    }));
    input.value = ""; // Limpia el campo de entrada
  }
});

// Evento que se dispara cuando se presiona una tecla en el campo de entrada
input.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    button.click(); // Simula un clic en el botón de envío si se presiona Enter
  }
});

// Evento que se dispara cuando la conexión WebSocket se cierra
socket.onclose = () => {
  const mensajeCierre = document.createElement("div");
  mensajeCierre.textContent = `El usuario ${nombreUsuario} ha salido del chat`;
  mensajeCierre.classList.add("mensaje", "mensaje-otro");
  chat.appendChild(mensajeCierre);
};

// Evento que se dispara cuando ocurre un error en la conexión WebSocket
socket.onerror = (error) => {
  console.log("WebSocket error ", error);
};