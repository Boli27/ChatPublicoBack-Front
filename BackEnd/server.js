const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid"); //Importa la función para generar IDs únicos

//Creamos el servidor WebSocket
const PORT = 8080; //Define el puerto en el que el servidor escuchará
const server = new WebSocket.Server({ port: PORT }); //Crea una nueva instancia del servidor WebSocket

let clients = []; //Lista para almacenar los clientes conectados

server.on("connection", (socket) => {
  //Genera un ID único para cada nuevo cliente
  const clientId = uuidv4();
  let clientName = ''; // Nombre del cliente, inicializado como vacío

  //Maneja los mensajes recibidos de los clientes
  socket.on("message", (data) => {
    const parsedData = JSON.parse(data); // Parseo del mensaje recibido desde el cliente

    //Si el mensaje es del tipo 'name', es decir, el cliente está enviando su nombre
    if (parsedData.type === 'name') {
      clientName = parsedData.name; // Asigna el nombre del cliente
      clients.push({ id: clientId, name: clientName, socket }); // Almacena el cliente en la lista

      //Envía el ID del cliente de vuelta al cliente conectado
      socket.send(JSON.stringify({ type: 'name', id: clientId }));

      //Notifica a todos los demás clientes que un nuevo usuario ha ingresado
      clients.forEach((client) => {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(JSON.stringify({
            type: 'notification',
            message: `El usuario ${clientName} ha ingresado al chat.`,
            id: clientId
          }));
        }
      });

      console.log(`Usuario: ${clientName} con ID: ${clientId} se ha conectado`);
    } else if (parsedData.type === 'message') {
      //Si el mensaje es del tipo 'message', es decir, un mensaje del chat
      console.log(`Mensaje recibido de ${clientName}: ${parsedData.message}`);
      
      //Envía el mensaje a todos los clientes conectados
      clients.forEach((client) => {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(JSON.stringify({
            type: 'message',
            message: parsedData.message,
            name: clientName, //Nombre del remitente
            userId: clientId, //ID del remitente
            time: parsedData.time //Hora en que el mensaje fue enviado
          }));
        }
      });
    }
  });

  //Maneja la desconexión de un cliente
  socket.on("close", () => {
    //Elimina al cliente de la lista de clientes conectados
    clients = clients.filter((client) => client.id !== clientId);
    
    //Notifica a todos los demás clientes que un usuario ha salido del chat
    clients.forEach((client) => {
      if (client.socket.readyState === WebSocket.OPEN) {
        client.socket.send(JSON.stringify({
          type: 'notification',
          message: `El usuario ${clientName} con id ${clientId} ha salido del chat.`,
          id: clientId
        }));
      }
    });

    console.log(`Cliente desconectado: ${clientName} con ID: ${clientId}`);
  });
});

//El servidor está escuchando en el puerto especificado
server.on("listening", () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
