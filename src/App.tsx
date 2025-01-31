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
  UserCircle,
  Plus,
  X,
  RotateCcw,
  Monitor,
  Smartphone,
  Globe,
  Check,
} from 'lucide-react';

interface Mood {
  user: string;
  mood: 'bonne' | 'neutre' | 'mauvaise';
}

interface TicketMetrics {
  name: string;
  icon: React.ReactNode;
  pendingTickets: number;
}

interface ListItem {
  id: string;
  text: string;
  trigram?: string;
  completed?: boolean;
}

function App() {
  const [humeur, setHumeur] = useState<Mood[]>([]);
  const [votes, setVotes] = useState({ pour: 0, contre: 0 });
  const [votedUsers, setVotedUsers] = useState<Set<string>>(new Set());
  const [username, setUsername] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  
  const [ticketMetrics] = useState<TicketMetrics[]>([
    {
      name: 'Web App',
      icon: <Monitor className="w-5 h-5" />,
      pendingTickets: 8,
    },
    {
      name: 'Mobile App',
      icon: <Smartphone className="w-5 h-5" />,
      pendingTickets: 12,
    },
    {
      name: 'API',
      icon: <Globe className="w-5 h-5" />,
      pendingTickets: 5,
    },
  ]);

  const [odjPoints, setOdjPoints] = useState<ListItem[]>([
    { id: '1', text: 'Revue des objectifs Q1', completed: false, trigram: 'MRP' },
    { id: '2', text: 'Planning des congés', completed: false, trigram: 'JSD' },
    { id: '3', text: 'Nouveaux projets', completed: false, trigram: 'ALS' },
  ]);
  const [decisions, setDecisions] = useState<ListItem[]>([
    { id: '1', text: 'Validation du planning', trigram: 'MRP' },
    { id: '2', text: 'Attribution des tâches', trigram: 'JSD' },
  ]);
  const [news, setNews] = useState<ListItem[]>([
    { id: '1', text: '🎉 Anniversaire de Marie jeudi prochain', type: 'team' },
    { id: '2', text: '📅 Team Building prévu le 15 avril', type: 'team' },
    { id: '3', text: '🎓 Formation React la semaine prochaine', type: 'team' },
    { id: '4', text: '📢 Nouvelle politique de télétravail', type: 'hr' },
    { id: '5', text: '💪 Nouveaux avantages CE', type: 'hr' },
    { id: '6', text: '🎯 Entretiens annuels en avril', type: 'hr' },
  ]);

  const [newOdjPoint, setNewOdjPoint] = useState('');
  const [newOdjTrigram, setNewOdjTrigram] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [newDecisionTrigram, setNewDecisionTrigram] = useState('');
  const [newNews, setNewNews] = useState('');
  const [newsType, setNewsType] = useState<'team' | 'hr'>('team');

  const handleVote = (type: 'pour' | 'contre') => {
    if (isAnonymous || !username || votedUsers.has(username)) return;
    
    setVotes(v => ({ ...v, [type]: v[type] + 1 }));
    setVotedUsers(prev => new Set(prev).add(username));
  };

  const resetVote = () => {
    if (isAnonymous || !username || !votedUsers.has(username)) return;
    
    setVotes(v => ({
      pour: votedUsers.has(username) && v.pour > 0 ? v.pour - 1 : v.pour,
      contre: votedUsers.has(username) && v.contre > 0 ? v.contre - 1 : v.contre,
    }));
    setVotedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(username);
      return newSet;
    });
  };

  const handleMoodChange = (newMood: 'bonne' | 'neutre' | 'mauvaise') => {
    if (isAnonymous || !username) return;
    
    setHumeur(prev => {
      const filtered = prev.filter(m => m.user !== username);
      return [...filtered, { user: username, mood: newMood }];
    });
  };

  const calculateMoodPercentages = () => {
    if (humeur.length === 0) return { bonne: 0, neutre: 0, mauvaise: 0 };
    
    const counts = humeur.reduce((acc, curr) => {
      acc[curr.mood]++;
      return acc;
    }, { bonne: 0, neutre: 0, mauvaise: 0 });

    return {
      bonne: (counts.bonne / humeur.length) * 100,
      neutre: (counts.neutre / humeur.length) * 100,
      mauvaise: (counts.mauvaise / humeur.length) * 100,
    };
  };

  const toggleOdjPoint = (id: string) => {
    setOdjPoints(points =>
      points.map(point =>
        point.id === id ? { ...point, completed: !point.completed } : point
      )
    );
  };

  const addOdjPoint = () => {
    if (newOdjPoint.trim() && newOdjTrigram.trim()) {
      setOdjPoints(prev => [...prev, {
        id: Date.now().toString(),
        text: newOdjPoint.trim(),
        trigram: newOdjTrigram.trim().toUpperCase(),
        completed: false
      }]);
      setNewOdjPoint('');
      setNewOdjTrigram('');
    }
  };

  const addDecision = () => {
    if (newDecision.trim() && newDecisionTrigram.trim()) {
      setDecisions(prev => [...prev, {
        id: Date.now().toString(),
        text: newDecision.trim(),
        trigram: newDecisionTrigram.trim().toUpperCase()
      }]);
      setNewDecision('');
      setNewDecisionTrigram('');
    }
  };

  const addNews = () => {
    if (newNews.trim()) {
      setNews(prev => [...prev, {
        id: Date.now().toString(),
        text: newNews.trim(),
        type: newsType
      }]);
      setNewNews('');
    }
  };

  const removeItem = (
    id: string,
    list: ListItem[],
    setList: React.Dispatch<React.SetStateAction<ListItem[]>>
  ) => {
    setList(list.filter(item => item.id !== id));
  };

  const moodPercentages = calculateMoodPercentages();
  const canParticipate = !isAnonymous && username.trim() !== '';
  const hasVoted = username && votedUsers.has(username);

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Humeur du Jour with Percentages */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Humeur du Jour</h2>
                <MessageCircle className="text-indigo-600 w-6 h-6" />
              </div>
              <div className="flex justify-around mb-4">
                <button
                  onClick={() => handleMoodChange('bonne')}
                  className={`p-3 rounded-full ${
                    !canParticipate ? 'opacity-50 cursor-not-allowed' :
                    humeur.find(m => m.user === username)?.mood === 'bonne' ? 'bg-green-100 text-green-600' : 'text-gray-400'
                  }`}
                  disabled={!canParticipate}
                >
                  <Sun className="w-8 h-8" />
                </button>
                <button
                  onClick={() => handleMoodChange('neutre')}
                  className={`p-3 rounded-full ${
                    !canParticipate ? 'opacity-50 cursor-not-allowed' :
                    humeur.find(m => m.user === username)?.mood === 'neutre' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'
                  }`}
                  disabled={!canParticipate}
                >
                  <Cloud className="w-8 h-8" />
                </button>
                <button
                  onClick={() => handleMoodChange('mauvaise')}
                  className={`p-3 rounded-full ${
                    !canParticipate ? 'opacity-50 cursor-not-allowed' :
                    humeur.find(m => m.user === username)?.mood === 'mauvaise' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                  disabled={!canParticipate}
                >
                  <CloudRain className="w-8 h-8" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-green-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 rounded-full h-2"
                      style={{ width: `${moodPercentages.bonne}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{Math.round(moodPercentages.bonne)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-yellow-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 rounded-full h-2"
                      style={{ width: `${moodPercentages.neutre}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{Math.round(moodPercentages.neutre)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${moodPercentages.mauvaise}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">{Math.round(moodPercentages.mauvaise)}%</span>
                </div>
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
                    className={`flex flex-col items-center transition-opacity ${!canParticipate || hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!canParticipate || hasVoted}
                  >
                    <ThumbsUp className="w-8 h-8 text-green-500 mb-2" />
                    <span className="text-lg font-semibold">{votes.pour}</span>
                  </button>
                  <button
                    onClick={() => handleVote('contre')}
                    className={`flex flex-col items-center transition-opacity ${!canParticipate || hasVoted ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!canParticipate || hasVoted}
                  >
                    <ThumbsDown className="w-8 h-8 text-red-500 mb-2" />
                    <span className="text-lg font-semibold">{votes.contre}</span>
                  </button>
                </div>
                
                {hasVoted && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={resetVote}
                      className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Réinitialiser mon vote
                    </button>
                  </div>
                )}
                
                {!canParticipate && (
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Vous devez entrer votre nom pour voter
                  </p>
                )}
              </div>
            </div>

            {/* Météo des Tickets */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Tickets non résolus</h2>
                <Calendar className="text-indigo-600 w-6 h-6" />
              </div>
              <div className="space-y-4">
                {ticketMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {metric.icon}
                        <span className="font-medium text-gray-700">{metric.name}</span>
                      </div>
                      <span className="text-lg font-semibold text-indigo-600">
                        {metric.pendingTickets}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* News Combined Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Actualités</h2>
                <div className="flex items-center gap-2">
                  <Users className="text-indigo-600 w-6 h-6" />
                  <Heart className="text-indigo-600 w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                {news.map(item => (
                  <div 
                    key={item.id} 
                    className={`p-3 ${
                      item.type === 'team' 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : 'bg-purple-100 text-purple-900'
                    } rounded-lg flex items-center justify-between`}
                  >
                    <p className="font-medium">
                      {item.text}
                    </p>
                    <button
                      onClick={() => removeItem(item.id, news, setNews)}
                      className={`${
                        item.type === 'team' 
                          ? 'text-emerald-700 hover:text-emerald-900' 
                          : 'text-purple-700 hover:text-purple-900'
                      } ml-2`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <select
                    value={newsType}
                    onChange={(e) => setNewsType(e.target.value as 'team' | 'hr')}
                    className="px-2 py-1 text-sm border rounded"
                  >
                    <option value="team">Équipe</option>
                    <option value="hr">RH</option>
                  </select>
                  <input
                    type="text"
                    value={newNews}
                    onChange={(e) => setNewNews(e.target.value)}
                    placeholder="Nouvelle actualité"
                    className="flex-1 px-2 py-1 text-sm border rounded"
                  />
                  <button
                    onClick={addNews}
                    className="text-green-500 hover:text-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ODJ & Décisions - Full Height */}
          <div className="lg:row-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">ODJ & Décisions</h2>
              <CheckSquare className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="space-y-6 h-full">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-4">Points à aborder</h3>
                <div className="space-y-3">
                  {odjPoints.map(point => (
                    <div key={point.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <button
                          onClick={() => toggleOdjPoint(point.id)}
                          className={`w-5 h-5 rounded border flex items-center justify-center
                            ${point.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 text-transparent'}`}
                        >
                          {point.completed && <Check className="w-4 h-4" />}
                        </button>
                        <span className={`text-gray-600 flex-1 ${point.completed ? 'line-through' : ''}`}>
                          {point.text}
                        </span>
                        {point.trigram && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {point.trigram}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(point.id, odjPoints, setOdjPoints)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={newOdjPoint}
                      onChange={(e) => setNewOdjPoint(e.target.value)}
                      placeholder="Nouveau point"
                      className="flex-1 px-2 py-1 text-sm border rounded"
                    />
                    <input
                      type="text"
                      value={newOdjTrigram}
                      onChange={(e) => setNewOdjTrigram(e.target.value)}
                      placeholder="TRI"
                      className="w-16 px-2 py-1 text-sm border rounded text-center uppercase"
                      maxLength={3}
                    />
                    <button
                      onClick={addOdjPoint}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-700 mb-4">Décisions prises</h3>
                <div className="space-y-3">
                  {decisions.map(decision => (
                    <div key={decision.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-green-600">{decision.text}</span>
                        {decision.trigram && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded">
                            {decision.trigram}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(decision.id, decisions, setDecisions)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={newDecision}
                      onChange={(e) => setNewDecision(e.target.value)}
                      placeholder="Nouvelle décision"
                      className="flex-1 px-2 py-1 text-sm border rounded"
                    />
                    <input
                      type="text"
                      value={newDecisionTrigram}
                      onChange={(e) => setNewDecisionTrigram(e.target.value)}
                      placeholder="TRI"
                      className="w-16 px-2 py-1 text-sm border rounded text-center uppercase"
                      maxLength={3}
                    />
                    <button
                      onClick={addDecision}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;