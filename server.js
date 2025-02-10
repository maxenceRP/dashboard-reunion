import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { info } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

class User {
    constructor(id, name, vote, mood) {
        this.id = id;
        this.name = name;
        this.vote = vote;
        this.mood = mood;
    }
}

const users = [];

io.on('connection', (socket) => {
  console.log('User connected with id:', socket.id);
  socket.emit('user-list', users);
  users.push(new User(socket.id, '', '', ''));
  io.emit('user-connect', socket.id);

  socket.on('content-change', (content) => {
    socket.broadcast.emit('content-update', content);
  });

  socket.on('update-name', (name) => {
    console.log('User with id:', socket.id, 'changed name to:', name);
    const user = users.find(user => user.id === socket.id);
    user.name = name;
    socket.broadcast.emit('user-update-name', { id: socket.id, name });
  });

  socket.on('disconnect', () => {
    users.splice(users.findIndex(user => user.id === socket.id), 1);
    io.emit('user-disconnect', socket.id);
    console.log('User disconnected with id:', socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, '10.0.0.113', () => {
  console.log(`Server running on http://10.0.0.113:${PORT}`);
});