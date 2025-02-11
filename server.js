import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
    constructor(id, name, vote, mood, ip) {
        this.id = id;
        this.name = name;
        this.vote = vote;
        this.mood = mood;
        this.ip = ip;
    }
}

class ListItem {
  constructor(id, text, trigram, completed, newsType) {
    this.id = id;
    this.text = text;
    this.trigram = trigram;
    this.completed = completed;
    this.newsType = newsType;
  }
}

var users = [];
var odjList = []
var decisionList = []
var newsList = []
var ticketMetrics = [0,0,0]

io.on('connection', (socket) => {
  console.log('[CONNECT] User with id:', socket.id, '(IP:', socket.handshake.address, ') connected');
  socket.emit('user-list', users);
  socket.emit('odj-list', odjList);
  socket.emit('decision-list', decisionList);
  socket.emit('news-list', newsList);
  socket.emit('ticket-metrics', ticketMetrics);
  users.push(new User(socket.id, '', '', ''));
  io.emit('user-connect', socket.id);

  // socket.on('content-change', (content) => {
  //   socket.broadcast.emit('content-update', content);
  // });

  socket.on('update-name', (name) => {
    console.log('[NAME] User with id:', socket.id, 'updated name to:', name);
    const user = users.find(user => user.id === socket.id);
    user.name = name;
    // console.log('users:', users);
    socket.broadcast.emit('user-update-name', { id: socket.id, name });
  });

  socket.on('add-odj', (odj) => {
    console.log('[ODJ] User with id:', socket.id, 'added odj with text:', odj.text);
    odjList.push(new ListItem(odj.id, odj.text, odj.trigram, odj.completed));
    socket.broadcast.emit('user-add-odj', odj);
  });

  socket.on('remove-odj', (id) => {
    console.log('[ODJ] User with id:', socket.id, 'removed odj with id:', id);
    odjList = odjList.filter(odj => odj.id !== id);
    socket.broadcast.emit('user-remove-odj', id);
  });

  socket.on('add-decision', (decision) => {
    console.log('[DECISION] User with id:', socket.id, 'added decision with text:', decision.text);
    decisionList.push(new ListItem(decision.id, decision.text, decision.trigram));
    socket.broadcast.emit('user-add-decision', decision);
  });

  socket.on('remove-decision', (id) => {
    console.log('[DECISION] User with id:', socket.id, 'removed decision with id:', id);
    decisionList = decisionList.filter(decision => decision.id !== id);
    socket.broadcast.emit('user-remove-decision', id);
  });
  
  socket.on('add-news', (news) => {
    console.log('[NEWS] User with id:', socket.id, 'added news with text:', news.text, 'and type:', news.newsType);
    newsList.push(new ListItem(news.id, news.text, news.newsType));
    socket.broadcast.emit('user-add-news', news);
  });

  socket.on('remove-news', (id) => {
    console.log('[NEWS] User with id:', socket.id, 'removed news with id:', id);
    newsList = newsList.filter(newsItem => newsItem.id !== id);
    socket.broadcast.emit('user-remove-news', id);
  });

  socket.on('add-vote', (vote) => {
    console.log('[VOTE] User with id:', socket.id, 'added vote with text:', vote);
    const user = users.find(user => user.id === socket.id);
    user.vote = vote;
    socket.broadcast.emit('user-add-vote', { id: socket.id, vote });
  });

  socket.on('remove-vote', () => {
    console.log('[VOTE] User with id:', socket.id, 'removed vote');
    const user = users.find(user => user.id === socket.id);
    user.vote = '';
    socket.broadcast.emit('user-remove-vote', socket.id);
  });

  socket.on('update-mood', (mood) => {
    console.log('[MOOD] User with id:', socket.id, 'added mood with text:', mood);
    const user = users.find(user => user.id === socket.id);
    user.mood = mood;
    socket.broadcast.emit('user-update-mood', { id: socket.id, value: mood });
  });

  socket.on('update-ticket-metric', (metric) => {
    console.log('[METRIC] User with id:', socket.id, 'updated metric with value:', metric);
    ticketMetrics[metric.index] = metric.value;
    io.emit('user-update-ticket-metric', metric);
  });

  socket.on('disconnect', () => {
    users.splice(users.findIndex(user => user.id === socket.id), 1);
    io.emit('user-disconnect', socket.id);
    console.log('[DISCONNECT] User with id:', socket.id, 'disconnected');
  });
});

const IP = "10.0.0.113"
const PORT = 3000;
httpServer.listen(PORT, IP, () => {
  console.log('[INFO]', `Server is running on http://${IP}:${PORT}`);
});