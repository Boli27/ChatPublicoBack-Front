const WebSocket = require("ws");
// Creamos el servidor WebSocket
const PORT = 8080;
const server = new WebSocket.Server({ port: PORT });

let clients = [];

server.on("connection", (socket) => {
  let userName = '';
  // Agregar el cliente a la lista de clientes
  clients.push(socket);

  // Al recibir un mensaje
  socket.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === 'name') {
      userName = data.name; // Guardamos el nombre del usuario
      console.log(`Nuevo usuario conectado: ${userName}`);

      // Notificar a todos los demás clientes que un nuevo usuario ha entrado al chat
      clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'notification', message: `${userName} ha entrado al chat.` }));
        }
      });
    } else if (data.type === 'message') {
      console.log(`Mensaje recibido de ${userName}: ${data.message}`);
      // Enviar el mensaje a todos los demás clientes conectados
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', name: userName, message: data.message }));
        }
      });
    }
  });

  // Manejar la desconexión de los clientes
  socket.on("close", () => {
    console.log(`${userName} se ha desconectado`);
    clients = clients.filter((client) => client !== socket);

    // Notificar a los demás usuarios de la desconexión
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'notification', message: `${userName} ha salido del chat.` }));
      }
    });
  });
});

server.on("listening", () => {
  console.log(`Servidor ejecutando en el puerto ${PORT}`);
});
