import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';
import 'dotenv/config';
import fs from 'fs';

// Variables pour les chemins
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const saving_folder = 'saves';

// Création du serveur
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuration du serveur
app.use(express.static(join(__dirname, 'dist')));

// Classe représentant un utilisateur
class User {
    constructor(id, name, vote, mood, ip) {
        this.id = id;
        this.name = name;
        this.vote = vote;
        this.mood = mood;
        this.ip = ip;
    }
}

// Classe représentant un item de liste
class ListItem {
  constructor(id, text, trigram, completed, newsType) {
    this.id = id;
    this.text = text;
    this.trigram = trigram;
    this.completed = completed;
    this.newsType = newsType;
  }
}

// Fonction pour sauvegarder un objet dans un fichier
function saveObjectToFile(obj, filename = 'data.json') {
  fs.writeFileSync(filename, JSON.stringify(obj, null, 4), 'utf8');
}

// Fonction pour charger un objet depuis un fichier
function loadObjectFromFile(filename) {
  if (!fs.existsSync(filename)) {
      console.log("Fichier non trouvé !");
      return null;
  }
  const data = fs.readFileSync(filename, 'utf8');
  return JSON.parse(data);
}

var users = [];
var odjList = loadObjectFromFile(path.join(saving_folder, 'odj.json')) || [];
var decisionList = loadObjectFromFile(path.join(saving_folder, 'decision.json')) || [];
var newsList = loadObjectFromFile(path.join(saving_folder, 'news.json')) || [];

var ticketMetrics = [0,0,0]

var testingIps = ["10.1.0.14"]

io.on('connection', (socket) => {
  // Connexion d'un utilisateur
  console.log('[CONNECT] User with id:', socket.id, '(IP:', socket.handshake.address, ') connected');

  // Vérification de la présence de l'utilisateur (même IP)
  if (users.find(user => user.ip === socket.handshake.address)) {
    // Si l'IP est une IP de test, on accepte la connexion
    if (!testingIps.includes(socket.handshake.address)) {  
      console.log('[ERROR] User with IP:', socket.handshake.address, 'is already connected, socket id:', socket.id);
      socket.emit('user-already-connected', 'Cette adresse IP est déjà connectée');
      socket.disconnect(true);
      return;
    }
  }

  // Envoi des données actuelles à l'utilisateur
  socket.emit('user-list', users);
  socket.emit('odj-list', odjList);
  socket.emit('decision-list', decisionList);
  socket.emit('news-list', newsList);
  socket.emit('ticket-metrics', ticketMetrics);
  users.push(new User(socket.id, '', '', '', socket.handshake.address));
  io.emit('user-connect', socket.id);

  // Mise à jour du nom de l'utilisateur
  socket.on('update-name', (name) => {
    console.log('[NAME] User with id:', socket.id, 'updated name to:', name);
    const user = users.find(user => user.id === socket.id);
    user.name = name;
    socket.broadcast.emit('user-update-name', { id: socket.id, name });
  });

  // Ajout d'un item à l'ordre du jour
  socket.on('add-odj', (odj) => {
    console.log('[ODJ] User with id:', socket.id, 'added odj with text:', odj.text);
    odjList.push(new ListItem(odj.id, odj.text, odj.trigram, odj.completed));
    socket.broadcast.emit('user-add-odj', odj);
  });

  // Suppression d'un item de l'ordre du jour
  socket.on('remove-odj', (id) => {
    console.log('[ODJ] User with id:', socket.id, 'removed odj with id:', id);
    odjList = odjList.filter(odj => odj.id !== id);
    socket.broadcast.emit('user-remove-odj', id);
  });

  // Ajout d'une décision à prendre
  socket.on('add-decision', (decision) => {
    console.log('[DECISION] User with id:', socket.id, 'added decision with text:', decision.text);
    decisionList.push(new ListItem(decision.id, decision.text, decision.trigram));
    socket.broadcast.emit('user-add-decision', decision);
  });

  // Suppression d'une décision à prendre
  socket.on('remove-decision', (id) => {
    console.log('[DECISION] User with id:', socket.id, 'removed decision with id:', id);
    decisionList = decisionList.filter(decision => decision.id !== id);
    socket.broadcast.emit('user-remove-decision', id);
  });
  
  // Ajout d'une actualité
  socket.on('add-news', (news) => {
    console.log('[NEWS] User with id:', socket.id, 'added news with text:', news.text, 'and type:', news.newsType);
    newsList.push(new ListItem(news.id, news.text, news.newsType));
    socket.broadcast.emit('user-add-news', news);
  });

  // Suppression d'une actualité
  socket.on('remove-news', (id) => {
    console.log('[NEWS] User with id:', socket.id, 'removed news with id:', id);
    newsList = newsList.filter(newsItem => newsItem.id !== id);
    socket.broadcast.emit('user-remove-news', id);
  });

  // Ajout d'un vote
  socket.on('add-vote', (vote) => {
    console.log('[VOTE] User with id:', socket.id, 'added vote with text:', vote);
    const user = users.find(user => user.id === socket.id);
    user.vote = vote;
    socket.broadcast.emit('user-add-vote', { id: socket.id, vote: vote });
  });

  // Suppression d'un vote
  socket.on('remove-vote', () => {
    console.log('[VOTE] User with id:', socket.id, 'removed vote');
    const user = users.find(user => user.id === socket.id);
    user.vote = '';
    socket.broadcast.emit('user-remove-vote', socket.id);
  });

  // Mise à jour de l'humeur de l'utilisateur
  socket.on('update-mood', (mood) => {
    console.log('[MOOD] User with id:', socket.id, 'added mood with text:', mood);
    const user = users.find(user => user.id === socket.id);
    user.mood = mood;
    socket.broadcast.emit('user-update-mood', { id: socket.id, value: mood });
  });

  // Mise à jour d'une métrique de ticket
  socket.on('update-ticket-metric', (metric) => {
    console.log('[METRIC] User with id:', socket.id, 'updated metric with value:', metric);
    ticketMetrics[metric.index] = metric.value;
    io.emit('user-update-ticket-metric', metric);
  });

  // Changer le statut de la coche d'un item de liste
  socket.on('toggle-odj', (coche) => {
    console.log('[ODJ] User with id:', socket.id, 'toggled odj with id:', coche.id);
    const odj = odjList.find(odj => odj.id === coche.id);
    odj.completed = coche.completed;
    socket.broadcast.emit('user-toggle-odj', coche);
  });

  // Déconnexion d'un utilisateur
  socket.on('disconnect', () => {
    users.splice(users.findIndex(user => user.id === socket.id), 1);
    io.emit('user-disconnect', socket.id);
    console.log('[DISCONNECT] User with id:', socket.id, 'disconnected');
    if (users.length === 0) {
      // Savegarde les news, décisions et ordre du jour
      saveObjectToFile(newsList, path.join(saving_folder, 'news.json'));
      saveObjectToFile(decisionList, path.join(saving_folder, 'decision.json'));
      saveObjectToFile(odjList, path.join(saving_folder, 'odj.json'));
      console.log('[SAVE] Saved news, decisions and odj');
    }
  });
});

const IP = process.env.HOST;
const PORT = Number(process.env.SOCKET_PORT) || 3000;
httpServer.listen(PORT, IP, () => {
  console.log('[INFO]', `Server is running on http://${IP}:${PORT}`);
});