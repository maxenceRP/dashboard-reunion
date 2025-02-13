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
  Plus,
  X,
  RotateCcw,
  Monitor,
  Smartphone,
  Globe,
  Check,
  Import,
  UsersRound
} from 'lucide-react';
import { io } from "socket.io-client";

// interface des métriques des tickets
interface TicketMetrics {
  name: string;
  icon: React.ReactNode;
  pendingTickets: number;
}

// interface de la liste des points à aborder, des décisions et des actualités
interface ListItem {
  id: string;
  text: string;
  trigram?: string;
  completed?: boolean;
  newsType?: string;
}

// interface de l'utilisateur
interface User {
  id: string;
  name: string;
  vote: string;
  mood: string;
}

var IP = '10.0.0.113';
var PORT = '3000';
const socket = io(`http://${IP}:${PORT}`);


function App() {
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);

  const [ticketMetrics, setTicketMetrics] = useState<TicketMetrics[]>([
    {
      name: 'EasyVista',
      icon: <Monitor className="w-5 h-5" />,
      pendingTickets: 0,
    },
    {
      name: 'mySoc',
      icon: <Smartphone className="w-5 h-5" />,
      pendingTickets: 0,
    },
    {
      name: 'myAccess',
      icon: <Globe className="w-5 h-5" />,
      pendingTickets: 0,
    }
  ]);
  const [odjPoints, setOdjPoints] = useState<ListItem[]>([]);
  const [decisions, setDecisions] = useState<ListItem[]>([]);
  const [news, setNews] = useState<ListItem[]>([]);

  const [newOdjPoint, setNewOdjPoint] = useState('');
  const [newOdjTrigram, setNewOdjTrigram] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [newDecisionTrigram, setNewDecisionTrigram] = useState('');
  const [newNews, setNewNews] = useState('');
  const [newsType, setNewsType] = useState<'team' | 'hr'>('team');

  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    // Evenements d'initialisation
    socket.on("user-list", (newUsers) => {
      setUsers(newUsers);
    });

    socket.on("odj-list", (odjPoints) => {
      setOdjPoints(odjPoints);
    });

    socket.on("decision-list", (decisions) => {
      setDecisions(decisions);
    });

    socket.on("news-list", (news) => {
      setNews(news);
    });

    socket.on("ticket-metrics", (metrics) => {
      setTicketMetrics((prev) => prev.map((metric, index) => {
        return { ...metric, pendingTickets: metrics[index] };
      }));
    });
    
    // Evenements de mise à jour en temps réel
    socket.on("user-connect", (userId) => {
      setUsers((prev) => [...prev, { id: userId, name: "", vote: "", mood: "" }]);
    });

    socket.on('user-already-connected', (message: string) => {
      setError(message);
    });

    socket.on("connect_error", () => {
      setError("Erreur de connexion au serveur");
    });

    socket.on("user-disconnect", (userId) => {
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    });

    socket.on("user-update-name", (newUser) => {
      setUsers((prev) => prev.map((user) => {
        if (user.id === newUser.id) {
          return { ...user, name: newUser.name };
        }
        return user;
      }));
    });

    socket.on("user-add-odj", (odjPoint) => {
      setOdjPoints(prev => [...prev, {
        id: odjPoint.id,
        text: odjPoint.text,
        trigram: odjPoint.trigram,
        completed: odjPoint.completed
      }]);
    });

    socket.on("user-remove-odj", (odjPointId) => {
      setOdjPoints(prev => prev.filter(point => point.id !== odjPointId));
    });

    socket.on("user-add-decision", (decision) => {
      setDecisions(prev => [...prev, {
        id: decision.id,
        text: decision.text,
        trigram: decision.trigram
      }]);
    });

    socket.on("user-remove-decision", (decisionId) => {
      setDecisions(prev => prev.filter(decision => decision.id !== decisionId));
    });

    socket.on("user-add-news", (news) => {
      setNews(prev => [...prev, {
        id: news.id,
        text: news.text,
        newsType: news.newsType
      }]);
    });

    socket.on("user-remove-news", (newsId) => {
      setNews(prev => prev.filter(news => news.id !== newsId));
    });

    socket.on("user-add-vote", (newVote) => {
      setUsers((prev) => prev.map((user) => {
        if (user.id === newVote.id) {
          console.log("user-add-vote", newVote.vote, user);
          return { ...user, vote: newVote.vote };
        }
        return user;
      }));
    });

    socket.on("user-remove-vote", (userId) => {
      setUsers((prev) => prev.map((user) => {
        if (user.id === userId) {
          console.log("user-remove-vote", user);
          return { ...user, vote: "" };
        }
        return user;
      }));
    });

    socket.on("user-update-mood", (mood) => {
      setUsers((prev) => prev.map((user) => {
        if (user.id === mood.id) {
          return { ...user, mood: mood.value };
        }
        return user;
      }));
    });

    socket.on("user-update-ticket-metric", (metric) => {
      setTicketMetrics(prev => prev.map((m, index) => {
        if (index === metric.index) {
          return { ...m, pendingTickets: metric.value };
        }
        return m;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  

  // Fonctions de gestion des votes
  const changeVote = (type: 'pour' | 'contre') => {
    if (isAnonymous) return;
    setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, vote: type};
      }
      return user;
    }));
    socket.emit("add-vote", type);
  };

  const resetVote = () => {
    if (isAnonymous) return;
    setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, vote: "" };
      }
      return user;
    }));
    socket.emit("remove-vote");
  };


  // Fonctions de gestion des humeurs
  const changeMood = (newMood: 'bonne' | 'neutre' | 'mauvaise') => {
      setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, name: username, mood: newMood };
      }
      return user;
    }));
    socket.emit("update-mood", newMood);
  };

  const calculateMoodPercentages = () => {
    const total = users.filter(user => user.mood !== "").length;
    if (total === 0) {
      return { bonne: 0, neutre: 0, mauvaise: 0 };
    }
    const moodCount = users.reduce((acc, user) => {
      if (user.mood === 'bonne') {
        acc.bonne++;
      } else if (user.mood === 'neutre') {
        acc.neutre++;
      } else if (user.mood === 'mauvaise') {
        acc.mauvaise++;
      }
      return acc;
    }, { bonne: 0, neutre: 0, mauvaise: 0 });
    
    const moodPercentages = {
      bonne: (moodCount.bonne / total) * 100,
      neutre: (moodCount.neutre / total) * 100,
      mauvaise: (moodCount.mauvaise / total) * 100
    };
    
    return moodPercentages;
  };


  // Fonctions de gestion des noms
  const changeUsername = (newUsername: string) => {
    setUsername(newUsername);
    setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, name: newUsername };
      }
      return user;
    }));
    socket.emit("update-name", newUsername);
  }


  // Fonctions de gestion des tickets
  const changeTicketMetric = (index: number, value: string) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue)) return;
    setTicketMetrics(prev => prev.map((metric, i) => {
      if (i === index) {
        return { ...metric, pendingTickets: newValue };
      }
      return metric;
    }));
    socket.emit("update-ticket-metric", { 'index': index, 'value': newValue });
  };


  // Fonctions de gestion de l'ODJ
  const toggleOdjPoint = (id: string) => {
    setOdjPoints(points =>
      points.map(point =>
        point.id === id ? { ...point, completed: !point.completed } : point
      )
    );
  };

  const addOdjPoint = () => {
    if (newOdjPoint.trim() && newOdjTrigram.trim()) {
      const odjPoint = {
        id: Date.now().toString(),
        text: newOdjPoint.trim(),
        trigram: newOdjTrigram.trim().toUpperCase(),
        completed: false
      };
      setOdjPoints(prev => [...prev, {
        id: odjPoint.id,
        text: odjPoint.text,
        trigram: odjPoint.trigram,
        completed: odjPoint.completed
      }]);
      setNewOdjPoint('');
      setNewOdjTrigram('');
      socket.emit("add-odj", odjPoint);
    }
  };

  function removeOdjPoint(id: string) {
    setOdjPoints(prev => prev.filter(point => point.id !== id));
    socket.emit("remove-odj", id);
  }


  // Fonctions de gestion de l'import de l'ODJ
  const handleButtonClick = () => {
    setShowInput(true);
  };

  function parsePoints(text: string) {
    // Split the text by new lines
    const points = text.split("\n");
    // Filter out any empty strings
    const filteredPoints = points.filter(point => point.trim() !== "");
    // Foreach point, trouver le trigramme et le contenu du point "ex: MRP : Faire le point sur le projet"
    // Si le trigramme n'est pas trouvé, le point est ignoré
    const parsedPoints = filteredPoints.map(point => {
      const match = point.match(/([A-Z]{3})\s*:\s*(.*)/);
      if (match) {
        return { trigram: match[1], text: match[2] };
      }
      return null;
    });
    // Filter out any null values
    const validPoints = parsedPoints.filter(point => point !== null);
    return validPoints;
  }

  function addNewPoints(points: { trigram: string; text: string }[]) {
    var id = Date.now();
    points.forEach(point => {
      const odjPoint = {
        id: (id++).toString(),
        text: point.text,
        trigram: point.trigram,
        completed: false
      };
      setOdjPoints(prev => [...prev, {
        id: odjPoint.id,
        text: odjPoint.text,
        trigram: odjPoint.trigram,
        completed: odjPoint.completed
      }]);
      socket.emit("add-odj", odjPoint);
    });
  }

  const handleSubmit = () => {
    const validPoints = parsePoints(text);
    addNewPoints(validPoints);
    setShowInput(false);
    setText("");
  };


  // Fonctions de gestion des décisions
  const addDecision = () => {
    if (newDecision.trim() && newDecisionTrigram.trim()) {
      const decision = {
        id: Date.now().toString(),
        text: newDecision.trim(),
        trigram: newDecisionTrigram.trim().toUpperCase()
      };
      setDecisions(prev => [...prev, {
        id: decision.id,
        text: decision.text,
        trigram: decision.trigram
      }]);
      setNewDecision('');
      setNewDecisionTrigram('');
      socket.emit("add-decision", decision);
    }
  };

  function removeDecision(id: string) {
    setDecisions(prev => prev.filter(decision => decision.id !== id));
    socket.emit("remove-decision", id);
  }


  // Fonctions de gestion des actualités
  const addNews = () => {
    if (newNews.trim()) {
      const news = {
        id: Date.now().toString(),
        text: newNews.trim(),
        newsType: newsType
      };
      setNews(prev => [...prev, {
        id: news.id,
        text: news.text,
        newsType: news.newsType
      }]);
      setNewNews('');
      socket.emit("add-news", news);
    }
  };

  function removeNews(id: string) {
    setNews(prev => prev.filter(news => news.id !== id));
    socket.emit("remove-news", id);
  }


  var moodPercentages = calculateMoodPercentages();
  const canParticipate = !isAnonymous && username.trim() !== '';

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur de connexion</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* User List Button */}
      <div className="absolute top-4 left-4">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="bg-white p-3 rounded-lg shadow-md text-indigo-600 hover:text-indigo-800 transition-colors relative"
          >
            <UsersRound className="w-6 h-6" />
          </button>
          
          {/* User List Popup */}
          {showUserList && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Participants</h3>
                <button
                  onClick={() => setShowUserList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                  >
                    {/* User Icon (vert si user.name = socketId sinon indigo) */}
                    <UserCircle
                      className={`w-6 h-6 ${user.id === socket.id ? 'text-green-500' : 'text-indigo-500'}`}
                    />
                    {/* user.name si different de "" sinon Anonyme */}
                    <span className="font-medium">
                      {user.name || "Anonyme"}
                    </span>
                    {user.vote && (
                      <span className="ml-auto text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        A voté
                      </span>
                    )}
                    {user.mood != "" && (
                      <span className="ml-auto text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        Humeur
                      </span>
                    )}
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    Aucun participant pour le moment
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      <div className="mx-auto">

        {/* User Profile Section  */}
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
                onChange={(e) => {
                  changeUsername(e.target.value);
                }}
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

        {/* Main Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Humeur du Jour with Percentages */}
          <div className="bg-white p-4 text-center rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Humeur du Jour</h2>
              <MessageCircle className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex justify-around mb-4">
              <button
                onClick={() => changeMood('bonne')}
                className={`p-3 rounded-full ${
                  !canParticipate ? 'opacity-50 cursor-not-allowed' :
                  users.find(user => user.id === socket.id)?.mood === 'bonne' ? 'bg-green-100 text-green-600' : 'text-gray-400'
                }`}
                disabled={!canParticipate}
              >
                <Sun className="w-8 h-8" />
              </button>
              <button
                onClick={() => {
                  changeMood('neutre');
                }}
                className={`p-3 rounded-full ${
                  !canParticipate ? 'opacity-50 cursor-not-allowed' :
                  users.find(user => user.id === socket.id)?.mood === 'neutre' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'
                }`}
                disabled={!canParticipate}
              >
                <Cloud className="w-8 h-8" />
              </button>
              <button
                onClick={() => changeMood('mauvaise')}
                className={`p-3 rounded-full ${
                  !canParticipate ? 'opacity-50 cursor-not-allowed' :
                  users.find(user => user.id === socket.id)?.mood === 'mauvaise' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
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
          <div className="bg-white p-4 text-center rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Votes</h2>
              <Users className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex justify-around mb-4">
                <button
                  onClick={() => changeVote('pour')}
                  className={`flex flex-col items-center transition-opacity ${!canParticipate || users.find(user => user.id === socket.id)?.vote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canParticipate || users.find(user => user.id === socket.id)?.vote != ''}
                >
                  <ThumbsUp className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-lg font-semibold">{users.filter(user => user.vote === 'pour').length}</span>
                </button>
                <button
                  onClick={() => changeVote('contre')}
                  className={`flex flex-col items-center transition-opacity ${!canParticipate || users.find(user => user.id === socket.id)?.vote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!canParticipate || users.find(user => user.id === socket.id)?.vote != ''}
                >
                  <ThumbsDown className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-lg font-semibold">{users.filter(user => user.vote === 'contre').length}</span>
                </button>
              </div>
              
              {users.find(user => user.id === socket.id)?.vote && (
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

          {/* ODJ & Décisions */}
          <div className="bg-white p-4 text-center col-span-2 row-span-2 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">ODJ & Décisions</h2>
              <CheckSquare className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="space-y-6">
              {/* ODJ */}
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
                        onClick={() => removeOdjPoint(point.id)}
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
                      placeholder="NGE"
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
              {/* Décisions */}
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
                        onClick={() => removeDecision(decision.id)}
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
                      placeholder="MRP"
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
              {/* Importer des points à aborder */}
              <div className="flex items-center justify-center">
                {!showInput ? (
                  <button
                    onClick={handleButtonClick}
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg text-sm"
                  >
                    <div className="flex gap-1 items-center">
                      <Import className="w-4 h-4" />
                        Importer
                    </div>
                  </button>       
                ) : (
                  <div className="mt-2 items-center">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-96 h-32"
                      placeholder="Saisir les points à aborder"
                    />
                    <button
                      onClick={handleSubmit}
                      className="bg-green-500 text-white px-2 py-1 rounded-lg mt-2 text-sm"
                    >
                      Soumettre
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Météo des Tickets */}
          <div className="bg-white p-4 text-center rounded-xl shadow-lg">
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
                    <input
                      type="number"
                      value={metric.pendingTickets}
                      onChange={(e) => changeTicketMetric(index, e.target.value)}
                      className="w-16 px-2 py-1 text-sm border rounded text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News Combined Section */}
          <div className="bg-white p-4 text-center rounded-xl shadow-lg">
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
                    item.newsType === 'team' 
                      ? 'bg-emerald-100 text-emerald-900' 
                      : 'bg-purple-100 text-purple-900'
                  } rounded-lg flex items-center justify-between`}
                >
                  <p className="font-medium">
                    {item.text}
                  </p>
                  <button
                    onClick={() => removeNews(item.id)}
                    className={`${
                      item.newsType === 'team' 
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
      </div>
    </div>
  );
}

export default App;