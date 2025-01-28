import React, { useState, useEffect } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Users,
  MessageCircle,
  Heart,
  CheckSquare,
  UserCircle,
} from 'lucide-react';
import { io } from "socket.io-client";

const socket = io("http://10.0.0.113:3000"); // Remplacez par l'URL de votre serveur WebSocket.

function App() {
  const [humeur, setHumeur] = useState('neutre');
  const [votes, setVotes] = useState({ pour: 0, contre: 0 });
  const [votesHistory, setVotesHistory] = useState<Array<{ name: string; vote: 'pour' | 'contre' }>>([]);
  const [votedUsers, setVotedUsers] = useState<Set<string>>(new Set());
  const [meteoTickets, setMeteoTickets] = useState('ensoleillé');
  const [username, setUsername] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);


  const handleVote = (type: 'pour' | 'contre') => {
    if (isAnonymous || !username) return;
    
    // Vérifiez si l'utilisateur a déjà voté
    if (votedUsers.has(username)) {
      alert("Vous avez déjà voté !");
      return;
    }

    // Enregistrez le vote
    setVotes(v => ({ ...v, [type]: v[type] + 1 }));
    setVotesHistory(prev => [...prev, { name: username, vote: type }]);

    // Ajoutez l'utilisateur à la liste des votants
    setVotedUsers(prev => new Set(prev).add(username));

    // Envoyez la mise à jour au serveur
    socket.emit("updateVotes", {
      votes: { ...votes, [type]: votes[type] + 1 },
      history: [...votesHistory, { name: username, vote: type }],
    });
  };

  useEffect(() => {
    socket.on("updateVotes", (updatedVotes) => {
      setVotes(updatedVotes);
    });
  
    socket.on("updateVotesHistory", (updatedHistory) => {
      setVotesHistory(updatedHistory);
    });
  
    return () => {
      socket.disconnect();
    };
  }, []);

  const canVote = !isAnonymous && username.trim() !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Section */}
        <div className="absolute top-4 right-4 flex items-center gap-4 bg-white rounded-lg shadow-md p-3">
          <UserCircle className="text-indigo-600 w-6 h-6" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-600">
                Rester anonyme
              </label>
            </div>
            {!isAnonymous && (
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Votre nom"
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-bold text-indigo-900 mb-8 text-center">
          Dashboard Réunion d'Équipe
          {!isAnonymous && username && (
            <span className="text-lg font-normal text-indigo-600 ml-2">
              - {username}
            </span>
          )}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Humeur du Jour */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Humeur du Jour</h2>
              <MessageCircle className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex justify-around">
              <button
                onClick={() => setHumeur('bonne')}
                className={`p-3 rounded-full ${
                  humeur === 'bonne' ? 'bg-green-100 text-green-600' : 'text-gray-400'
                }`}
              >
                <Sun className="w-8 h-8" />
              </button>
              <button
                onClick={() => setHumeur('neutre')}
                className={`p-3 rounded-full ${
                  humeur === 'neutre' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'
                }`}
              >
                <Cloud className="w-8 h-8" />
              </button>
              <button
                onClick={() => setHumeur('mauvaise')}
                className={`p-3 rounded-full ${
                  humeur === 'mauvaise' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                }`}
              >
                <CloudRain className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Système de Vote */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Votes</h2>
              <Users className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex justify-around mb-4">
                <button
                  onClick={() => handleVote('pour')}
                  className={`flex flex-col items-center transition-opacity ${!canVote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canVote}
                >
                  <ThumbsUp className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-lg font-semibold">{votes.pour}</span>
                </button>
                <button
                  onClick={() => handleVote('contre')}
                  className={`flex flex-col items-center transition-opacity ${!canVote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canVote}
                >
                  <ThumbsDown className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-lg font-semibold">{votes.contre}</span>
                </button>
              </div>
              
              {/* Vote History */}
              {votesHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Historique des votes</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {votesHistory.map((vote, index) => (
                      <div key={index} className="text-sm flex items-center gap-2">
                        <span className="font-medium text-gray-800">{vote.name}</span>
                        <span className="text-gray-500">a voté</span>
                        {vote.vote === 'pour' ? (
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!canVote && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Vous devez entrer votre nom pour voter
                </p>
              )}
            </div>
          </div>

          {/* Météo des Tickets */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Météo des Tickets</h2>
              <Calendar className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex justify-around">
              <button
                onClick={() => setMeteoTickets('ensoleillé')}
                className={`p-3 rounded-full ${
                  meteoTickets === 'ensoleillé' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'
                }`}
              >
                <Sun className="w-8 h-8" />
              </button>
              <button
                onClick={() => setMeteoTickets('nuageux')}
                className={`p-3 rounded-full ${
                  meteoTickets === 'nuageux' ? 'bg-gray-100 text-gray-600' : 'text-gray-400'
                }`}
              >
                <Cloud className="w-8 h-8" />
              </button>
              <button
                onClick={() => setMeteoTickets('orageux')}
                className={`p-3 rounded-full ${
                  meteoTickets === 'orageux' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                }`}
              >
                <CloudRain className="w-8 h-8" />
              </button>
            </div>
          </div>

          {/* Ordre du Jour et Décisions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">ODJ & Décisions</h2>
              <CheckSquare className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700">Points à aborder</h3>
                <ul className="list-disc list-inside text-gray-600 mt-2">
                  <li>Revue des objectifs Q1</li>
                  <li>Planning des congés</li>
                  <li>Nouveaux projets</li>
                </ul>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-700">Décisions prises</h3>
                <ul className="list-disc list-inside text-green-600 mt-2">
                  <li>Validation du planning</li>
                  <li>Attribution des tâches</li>
                </ul>
              </div>
            </div>
          </div>

          {/* News Vie d'Équipe */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">News Vie d'Équipe</h2>
              <Users className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-indigo-700">🎉 Anniversaire de Marie jeudi prochain</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-purple-700">📅 Team Building prévu le 15 avril</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <p className="text-pink-700">🎓 Formation React la semaine prochaine</p>
              </div>
            </div>
          </div>

          {/* News RH */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">News RH</h2>
              <Heart className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-700">📢 Nouvelle politique de télétravail</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-green-700">💪 Nouveaux avantages CE</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-yellow-700">🎯 Entretiens annuels en avril</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;