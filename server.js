const WebSocket = require("ws");
// Creamos el servidor WebSocked
const PORT = 8080;
const server = new WebSocket.Server({ port: PORT });

let clients = [];

//evento cuando un cliente se conect
server.on("connection", (socket) => {
  console.log("Nuevo Cliente conectado");
  clients.push(socket);

  //manejar los mensajes recibidos de los clientes
  socket.on("message", (message) => {
    console.log(`Mensaje recibido: ${message}`);
    //enviar el mensaje a todos los demas clientes conectados
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Manejar la desconeccion de los clientes
  socket.on("close", () => {
    console.log("Cliente Desconectado");
    clients = clients.filter((client) => client !== socket);
  });
});

server.on("listening", () => {
  console.log(`Servidor ejecutando en el puerto ${PORT}`);
});
