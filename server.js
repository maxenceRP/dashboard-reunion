import { Server } from "socket.io";

// Créer le serveur WebSocket
const io = new Server(3000, {
  cors: {
    origin: "*", // Permettre à tous les clients d'accéder au serveur
  },
});

io.listen(3000);

// Variables partagées entre les utilisateurs
let votes = { pour: 0, contre: 0 };
let votesHistory = [];

// Gérer les connexions des utilisateurs
io.on("connection", (socket) => {
  console.log("Utilisateur connecté :", socket.id);

  // Envoyer l'état actuel au nouvel utilisateur
  socket.emit("updateVotes", votes);
  socket.emit("updateVotesHistory", votesHistory);

  // Écouter les mises à jour de votes
  socket.on("updateVotes", (data) => {
    votes = data.votes;
    votesHistory = data.history;

    // Diffuser les mises à jour à tous les utilisateurs connectés
    io.emit("updateVotes", votes);
    io.emit("updateVotesHistory", votesHistory);
  });

  // Gérer la déconnexion
  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté :", socket.id);
  });
});

console.log("Serveur WebSocket démarré sur le port 3000");
