import React, { useState } from 'react';
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
} from 'lucide-react';

function App() {
  const [humeur, setHumeur] = useState('neutre');
  const [votes, setVotes] = useState({ pour: 0, contre: 0 });
  const [meteoTickets, setMeteoTickets] = useState('ensoleillé');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-8 text-center">
          Dashboard Réunion d'Équipe
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
            <div className="flex justify-around">
              <button
                onClick={() => setVotes(v => ({ ...v, pour: v.pour + 1 }))}
                className="flex flex-col items-center"
              >
                <ThumbsUp className="w-8 h-8 text-green-500 mb-2" />
                <span className="text-lg font-semibold">{votes.pour}</span>
              </button>
              <button
                onClick={() => setVotes(v => ({ ...v, contre: v.contre + 1 }))}
                className="flex flex-col items-center"
              >
                <ThumbsDown className="w-8 h-8 text-red-500 mb-2" />
                <span className="text-lg font-semibold">{votes.contre}</span>
              </button>
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