const socketio = require('socket.io');

let io;

function init(server) {
  io = socketio(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

    // Example: Listen for a custom event from the client
    socket.on('chat message', (msg) => {
      console.log('message: ' + msg);
      // Broadcast the message to all clients
      io.emit('chat message', msg);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = {
  init,
  getIO,
};
