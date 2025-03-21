import React, { useState, useEffect } from 'react';
import copy from 'copy-to-clipboard';
import { Bounce, Flip, ToastContainer, toast } from 'react-toastify';
import {
  Sun,
  Cloud,
  CloudRain,
  ThumbsUp,
  ThumbsDown,
  Ticket,
  TicketCheck,
  Users,
  Vote,
  MessageCircleHeart,
  CheckSquare,
  UserCircle,
  Plus,
  X,
  RotateCcw,
  KeyRound,
  ShieldAlert,
  Check,
  Import,
  Download,
  UsersRound,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Shrink,
  Expand
} from 'lucide-react';
import { io } from "socket.io-client";

// interface des métriques des tickets
interface TicketMetrics {
  name: string;
  icon: React.ReactNode;
  pendingTickets: number;
  redThreshold: number;
  yellowThreshold: number;
}

// interface de la liste des points à aborder, des décisions et des actualités
interface ListItem {
  id: string;
  text: string;
  trigrams?: string[];
  completed?: boolean;
  newsType?: string;
  owner?: string;
  showNotes?: boolean;
  notes?: string;
}

// interface de l'utilisateur
interface User {
  id: string;
  name: string;
  vote: string;
  mood: string;
  cr: boolean;
}

var IP = '10.0.0.113';
var PORT = '3000';
const socket = io(`http://${IP}:${PORT}`);


function App() {
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isCR, setIsCR] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [showUserProfil, setShowUserProfil] = useState(false);

  const [ticketMetrics, setTicketMetrics] = useState<TicketMetrics[]>([
    {
      name: 'EasyVista',
      icon: <TicketCheck className="w-5 h-5" />,
      pendingTickets: 0,
      redThreshold: 10,
      yellowThreshold: 5
    },
    {
      name: 'mySoc',
      icon: <ShieldAlert className="w-5 h-5" />,
      pendingTickets: 0,
      redThreshold: 5,
      yellowThreshold: 3
    },
    {
      name: 'myAccess',
      icon: <KeyRound className="w-5 h-5" />,
      pendingTickets: 0,
      redThreshold: 10,
      yellowThreshold: 5
    }
  ]);
  const [odjPoints, setOdjPoints] = useState<ListItem[]>([]);
  const [decisions, setDecisions] = useState<ListItem[]>([]);
  const [news, setNews] = useState<ListItem[]>([]);

  const [newOdjPoint, setNewOdjPoint] = useState('');
  const [newOdjTrigrams, setNewOdjTrigrams] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [newDecisionTrigrams, setNewDecisionTrigrams] = useState('');
  const [newNews, setNewNews] = useState('');
  const [newsType, setNewsType] = useState<'team' | 'hr'>('team');
  const [PointTitle, setTitle] = useState('');

  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");

  // Toast Notifications
  const successToast = (message: string) => toast.success(message, { transition: Flip, position: 'bottom-center' });
  const errorToast = (message: string) => toast.error(message);
  const infoToast = (message: string) => toast.info(message, { transition: Flip, position: 'top-center' });

  useEffect(() => {
    // Evenements d'initialisation
    socket.on("user-list", (newUsers) => {
      setUsers(newUsers);
    });

    socket.on("odj-list", (odjPoints) => {
      console.log(odjPoints);
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
      setUsers((prev) => [...prev, { id: userId, name: "", vote: "", mood: "", cr: false }]);
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
        trigrams: odjPoint.trigrams,
        completed: odjPoint.completed,
        owner: odjPoint.owner
      }]);
    });

    socket.on("user-remove-odj", (odjPointId) => {
      setOdjPoints(prev => prev.filter(point => point.id !== odjPointId));
    });

    socket.on("user-remove-all-odj", () => {
      setOdjPoints([]);
    });

    socket.on("user-toggle-odj", (odjPoint) => {
      setOdjPoints(prev => prev.map(point => {
        if (point.id === odjPoint.id) {
          return { ...point, completed: odjPoint.completed };
        }
        return point;
      }));
    });

    socket.on("user-update-notes", (notes) => {
      setOdjPoints(prev => prev.map(point => {
        if (point.id === notes.id) {
          return { ...point, notes: notes.notes };
        }
        return point;
      }));
    });

    socket.on("user-add-decision", (decision) => {
      setDecisions(prev => [...prev, {
        id: decision.id,
        text: decision.text,
        trigrams: decision.trigrams,
        owner: decision.owner
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
          return { ...user, vote: newVote.vote };
        }
        return user;
      }));
    });

    socket.on("user-remove-vote", (userId) => {
      setUsers((prev) => prev.map((user) => {
        if (user.id === userId) {
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

    socket.on("user-update-cr", (cr) => {
      setUsers((prev) => prev.map((user) => {
        if (user.id === cr.id) {
          return { ...user, cr: cr.value };
        }
        return user;
      }
      ));
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
    if (isAnonymous) {
      errorToast("Vous devez entrer votre nom pour voter");
      return;
    }
    setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, vote: type};
      }
      return user;
    }));
    socket.emit("add-vote", type);
  };

  const resetVote = () => {
    if (isAnonymous) {
      errorToast("Vous devez entrer votre nom pour voter");
      return;
    }
    setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, vote: "" };
      }
      return user;
    }));
    socket.emit("remove-vote");
    infoToast("Votre vote a été réinitialisé");
  };


  // Fonctions de gestion des humeurs
  const changeMood = (newMood: 'bonne' | 'neutre' | 'mauvaise') => {
      setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, mood: newMood };
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
    newUsername = newUsername.trim();
    if (newUsername === "") {
      setIsCR(false);
    }
    if (users.find(user => user.name === newUsername) && newUsername !== "") {
      errorToast("Ce nom est déjà utilisé par un autre participant");
      return;
    }
    if (newUsername.length > 20) {
      errorToast("Votre nom ne doit pas dépasser 20 caractères");
      return;
    }
    setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, name: newUsername };
      }
      return user;
    }));
    socket.emit("update-name", newUsername);
  }
  

  const becomeAnonymous = (checked: boolean) => {
    setIsAnonymous(checked);
    setShowUserProfil(!checked);
    // reset vote and mood if user becomes anonymous
    if (checked) {
      
      setIsCR(false);
      setUsers((prev) => prev.map((user) => {
        if (user.id === socket.id) {
          return { ...user, name: "", vote: "", mood: "" };
        }
        return user;
      }));
      socket.emit("update-name", "");
      socket.emit("remove-vote");
      socket.emit("update-mood", "");
      infoToast("Vous êtes maintenant anonyme. Votre vote et votre humeur ont été réinitialisés");
    }
  }

  const becomeCR = (checked: boolean) => {
    setIsCR(checked);
    setUsers((prev) => prev.map((user) => {
      if (user.id === socket.id) {
        return { ...user, cr: checked };
      }
      return user;
    }));
    socket.emit("update-cr", checked);
  }


  // Fonctions de gestion des tickets
  const changeTicketMetric = (index: number, value: string) => {
    const newValue = parseInt(value, 10) || 0;
    if (isNaN(newValue) || newValue >= 100 || newValue < 0) {
      errorToast(`La valeur ${value} n'est pas valide`);
      return;
    }
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
    socket.emit("toggle-odj", {id: id, completed: !odjPoints.find(point => point.id === id)?.completed});
  };

  const addOdjPoint = () => {
    if (!newOdjPoint.trim()) {
      errorToast("Veuillez entrer un point à aborder");
      return;
    }
    if (!newOdjTrigrams.trim()) {
      errorToast("Veuillez entrer un ou des trigrammes");
      return;
    }
    const odjPoint = {
      id: Date.now().toString(),
      text: newOdjPoint.trim(),
      trigrams: newOdjTrigrams.trim().toUpperCase().split(/[\s/,]+/),
      completed: false,
      owner: socket.id
    };
    setOdjPoints(prev => [...prev, {
      id: odjPoint.id,
      text: odjPoint.text,
      trigrams: odjPoint.trigrams,
      completed: odjPoint.completed,
      owner: odjPoint.owner
    }]);
    setNewOdjPoint('');
    setNewOdjTrigrams('');
    socket.emit("add-odj", odjPoint);
  };

  function removeOdjPoint(id: string) {
    setOdjPoints(prev => prev.filter(point => point.id !== id));
    socket.emit("remove-odj", id);
  }

  function removeAllOdjPoints() {
    setOdjPoints([]);
    socket.emit("remove-all-odj");
  }

  const changeTitle = (ownerId: string) => {
    const userTitle = ownerId == socket.id ? "vous" : users.find(user => user.id === ownerId)?.name;
    setTitle(`Proposé par ${userTitle || "un anonyme"}`);
  }


  // Fonctions de gestion de l'import de l'ODJ
  const handleButtonClick = () => {
    setShowInput(true);
  };

  function parsePoints(text: string) {
    if (!text) {
      errorToast("Veuillez entrer des points à aborder");
      return [];
    }
    const points = text.split("\n");
    const filteredPoints = points.filter(point => point.trim() !== "");
    const parsedPoints = filteredPoints.map(point => {
      // Match trigram and text: Example: MRP/PSP NGE : Point text. 
      const match = point.match(/([A-Z0-9\/ ]+):(.+)/);
      if (match) {
        return { trigrams : match[1].trim().toUpperCase().split(/[\s/,]+/), text: match[2].trim() };
      }
      return null;
    });
    // Filter out any null values
    const validPoints = parsedPoints.filter(point => point !== null);
    return validPoints;
  }

  function addNewPoints(points: { trigrams: string[], text: string }[]) {
    var id = Date.now();
    points.forEach(point => {
      const odjPoint = {
        id: (id++).toString(),
        text: point.text,
        trigrams: point.trigrams,
        completed: false,
        owner: socket.id
      };
      setOdjPoints(prev => [...prev, {
        id: odjPoint.id,
        text: odjPoint.text,
        trigrams: odjPoint.trigrams,
        completed: odjPoint.completed,
        owner: odjPoint.owner
      }]);
      socket.emit("add-odj", odjPoint);
    });
  }

  const handleSubmit = () => {
    if (!text) {
      errorToast("Veuillez entrer des points à aborder");

    }
    else {
      const validPoints = parsePoints(text);
      addNewPoints(validPoints);
    }
    setShowInput(false);
    setText("");
  };

  // Fonctions de gestion des notes
  const toggleNotes = (id: string) => {
    setOdjPoints(points =>
      points.map(point =>
        point.id === id ? { ...point, showNotes: !point.showNotes } : point
      )
    );
  };

  const changeNotes = (id: string, notes: string) => {
    setOdjPoints(points =>
      points.map(point =>
        point.id === id ? { ...point, notes: notes } : point
      )
    );
    socket.emit("update-notes", {id: id, notes: notes});
  };

  // Fonctions de gestion de l'export de l'ODJ et des décisions
  const CopyToClipboard = (text: string) => {
    try {
      copy(text);
      successToast("Texte copié dans le presse-papier");
    } catch (err) {
      alert("Impossible de copier le texte dans le presse-papier");
      errorToast("Impossible de copier le texte dans le presse-papier");
    }
  }


  const handleExport = () => {
    // Exporte les points à aborder (et ses notes) et les décisions prises dans un fichier texte et le télécharge
    // Format du texte : 
    // 📌 Ordre du Jour (ODJ) :

    //🔹 MRP : ODJ test 1
    //   ➡️ Notes test 1
    //🔹 MRP : ODJ test 2
    //   ➡️ Notes test 2
    //
    //
    // ✅ Décisions :

    // ✔️ MRP : Decision test 1
    // ✔️ MRP : Decision test 2
    const odjText = odjPoints.map(point => {
      const notes = point.notes?.split("\n").filter(line => line.trim() !== "").map(note => `     ➡️ ${note}`).join("\n") || '     ➡️';
      return `🔹 ${point.trigrams?.join(" / ")} : ${point.text}\n${notes}`
    }).join("\n");
    const decisionText = decisions.map(decision => `✔️ ${decision.trigrams?.join(" / ")} : ${decision.text}`).join("\n");
    const text = `📌 Ordre du Jour (ODJ) :\n\n${odjText}\n\n\n✅ Décisions :\n\n${decisionText}`;
    // Copier dans le presse-papier
    CopyToClipboard(text);
    console.log(text);
  };


  // Fonctions de gestion des décisions
  const addDecision = () => {
    if (!newDecision.trim()) {
      errorToast("Veuillez entrer une décision");
      return;
    }
    if (!newDecisionTrigrams.trim()) {
      errorToast("Veuillez entrer un trigramme");
      return;
    }
    const decision = {
      id: Date.now().toString(),
      text: newDecision.trim(),
      trigrams: newDecisionTrigrams.trim().toUpperCase().split(/[\s/,]+/),
      owner: socket.id
    };
    setDecisions(prev => [...prev, {
      id: decision.id,
      text: decision.text,
      trigrams: decision.trigrams,
      owner: decision.owner
    }]);
    setNewDecision('');
    setNewDecisionTrigrams('');
    socket.emit("add-decision", decision);
  };

  function removeDecision(id: string) {
    setDecisions(prev => prev.filter(decision => decision.id !== id));
    socket.emit("remove-decision", id);
  }


  // Fonctions de gestion des actualités
  const addNews = () => {
    if (!newNews.trim()) {
      errorToast("Veuillez entrer une actualité");
      return;
    }
    const news = {
      id: Date.now().toString(),
      text: newNews.trim(),
      newsType: newsType,
      owner: socket.id
    };
    setNews(prev => [...prev, {
      id: news.id,
      text: news.text,
      newsType: news.newsType,
      owner: news.owner
    }]);
    setNewNews('');
    socket.emit("add-news", news);
  };

  function removeNews(id: string) {
    setNews(prev => prev.filter(news => news.id !== id));
    socket.emit("remove-news", id);
  }


  var moodPercentages = calculateMoodPercentages();
  const canParticipate = !isAnonymous && users.find(user => user.id === socket.id)?.name.trim() !== "";
  const AnonymeTitle = "Entrez votre nom pour voter";

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

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="mx-auto">
        {/* Toast Notifications */}
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
          transition={Bounce}
        />
        {/* Popup de la liste des utilisateurs */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="bg-white p-3 rounded-lg shadow-md text-indigo-600 hover:text-indigo-800 transition-colors relative"
          >
            <UsersRound className="w-6 h-6" />
          </button>
          
          {/* User List Popup */}
          {showUserList && (
            <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Participants</h3>
                <span className="text-sm text-gray-500 font-medium rounded-full bg-gray-100 px-2 py-1" title="Nombre de participants">{users.length}</span>
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
                    {user.name ? (
                      <UserCircle className={`w-6 h-6 ${user.id === socket.id ? 'text-green-500' : 'text-indigo-500'}`} />
                    ) : (
                      <EyeOff className={`w-6 h-6 ${user.id === socket.id ? 'text-green-500' : 'text-indigo-500'}`} />
                    )}
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
                    {user.cr && (
                      <span className="ml-auto text-xs px-2 py-1 bg-yellow-100 text-red-800 rounded">
                        CR
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

        {/* Profil utilisateur */}
        <div className="absolute top-4 right-4 flex items-center gap-4 bg-white rounded-lg shadow-md p-3">
          <UserCircle className="text-indigo-600 w-6 h-6" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => becomeAnonymous(e.target.checked)}
                className="rounded text-indigo-600"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-600">
                Rester anonyme
              </label>
              {!showUserProfil &&
                <button
                  onClick={() => setShowUserProfil(true)}
                  className="ml-auto text-light-grey-600"
                  title='Afficher le profil utilisateur'
                >
                  <Expand className="w-4 h-4" />
                </button>
              }
              {showUserProfil &&
                <button
                  onClick={() => setShowUserProfil(false)}
                  className="ml-auto text-light-grey-600" 
                  title='Masquer le profil utilisateur'
                >
                  <Shrink className="w-4 h-4" />
                </button>
              }
            </div>
            {showUserProfil && (
              <input
                type="text"
                value={users.find(user => user.id === socket.id)?.name}
                onChange={(e) => changeUsername(e.target.value)}
                placeholder="Votre nom"
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              
            )}
            {showUserProfil && users.find(user => user.id === socket.id)?.name && (
              <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="cr"
                    checked={isCR}
                    onChange={(e) => becomeCR(e.target.checked)}
                    className="rounded text-red-600"
                  />
                <label htmlFor="cr" className="text-sm text-gray-600">
                  Je fais le CR
                </label>
              </div>
            )} 
          </div>
        </div>

        {/* Titre du Dashboard */}
        <h1 className="text-3xl font-bold text-indigo-900 mb-8 text-center">
          Dashboard Réunion d'Équipe
          {!isAnonymous && users.find(user => user.id === socket.id)?.name && (
            <span className="text-lg font-normal text-indigo-600 ml-2">
              - {users.find(user => user.id === socket.id)?.name}
            </span>
          )}
        </h1>

        {/* Section des Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Humeur du Jour with Percentages */}
          <div className="bg-white p-4 text-center rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Humeur du Jour</h2>
              <MessageCircleHeart className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex flex-wrap justify-around mb-4">
              <button
                onClick={canParticipate ? () => changeMood('bonne') : () => errorToast("Vous devez entrer votre nom pour voter")}
                className={`p-3 rounded-full ${
                  !canParticipate ? 'opacity-50 cursor-not-allowed' :
                  users.find(user => user.id === socket.id)?.mood === 'bonne' ? 'bg-green-100 text-green-600' : 'text-gray-400'
                }`}
                title={canParticipate ? "Bonne humeur" : AnonymeTitle}
              >
                <Sun className="w-8 h-8" />
              </button>
              <button
                onClick={canParticipate ? () => changeMood('neutre') : () => errorToast("Vous devez entrer votre nom pour voter")}
                className={`p-3 rounded-full ${
                  !canParticipate ? 'opacity-50 cursor-not-allowed' :
                  users.find(user => user.id === socket.id)?.mood === 'neutre' ? 'bg-yellow-100 text-yellow-600' : 'text-gray-400'
                }`}
                title={canParticipate ? "Humeur neutre" : AnonymeTitle}
              >
                <Cloud className="w-8 h-8" />
              </button>
              <button
                onClick={canParticipate ? () => changeMood('mauvaise') : () => errorToast("Vous devez entrer votre nom pour voter")}
                className={`p-3 rounded-full ${
                  !canParticipate ? 'opacity-50 cursor-not-allowed' :
                  users.find(user => user.id === socket.id)?.mood === 'mauvaise' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                }`}
                title={canParticipate ? "Mauvaise humeur" : AnonymeTitle}
              >
                <CloudRain className="w-8 h-8" />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-green-500" />
                <div 
                  className="flex-1 bg-gray-200 rounded-full h-2"
                  title={users.filter(user => user.mood === 'bonne').map(user => user.name).join(", ")}
                >
                  <div
                    className="bg-green-500 rounded-full h-2"
                    style={{ width: `${moodPercentages.bonne}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{Math.round(moodPercentages.bonne)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-yellow-500" />
                <div
                  className="flex-1 bg-gray-200 rounded-full h-2"
                  title={users.filter(user => user.mood === 'neutre').map(user => user.name).join(", ")}
                >
                  <div
                    className="bg-yellow-500 rounded-full h-2"
                    style={{ width: `${moodPercentages.neutre}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">{Math.round(moodPercentages.neutre)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-500" />
                <div 
                  className="flex-1 bg-gray-200 rounded-full h-2"
                  title={users.filter(user => user.mood === 'mauvaise').map(user => user.name).join(", ")}
                >
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
              <Vote className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-wrap justify-around mb-4">
                <button
                  onClick={canParticipate ? () => changeVote('pour') : () => errorToast("Vous devez entrer votre nom pour voter")}
                  className={`flex flex-col items-center transition-opacity ${!canParticipate || users.find(user => user.id === socket.id)?.vote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={canParticipate ? "Voter pour" : AnonymeTitle}
                >
                  <ThumbsUp className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-lg font-semibold">{users.filter(user => user.vote === 'pour').length}</span>
                </button>
                <button
                  onClick={canParticipate ? () => changeVote('contre') : () => errorToast("Vous devez entrer votre nom pour voter")}
                  className={`flex flex-col items-center transition-opacity ${!canParticipate || users.find(user => user.id === socket.id)?.vote ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={canParticipate ? "Voter contre" : AnonymeTitle}
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

              {canParticipate && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div>
                    <h3 className="text-sm font-medium text-green-600">Pour</h3>
                    <ul className="text-xs text-gray-500">
                      {users.filter(user => user.vote === 'pour').map((user, index) => (
                        <li key={index}>{user.name || "Anonyme"}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-red-600">Contre</h3>
                    <ul className="text-xs text-gray-500">
                      {users.filter(user => user.vote === 'contre').map((user, index) => (
                        <li key={index}>{user.name || "Anonyme"}</li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                <div className="flex items-center justify-center mb-4 relative">
                  <h3 className="font-medium text-gray-700 text-center flex-1">Points à aborder</h3>
                  <button
                    onClick={() => removeAllOdjPoints()}
                    className="text-red-500 hover:text-red-700 absolute right-0 p-2"
                    title='Supprimer tous les points'
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3">
                  {odjPoints.map(point => (
                    <div key={point.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
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
                          <span
                            className={`text-gray-600 flex-1 ${point.completed ? 'line-through' : ''}`}
                            onMouseOverCapture={() => changeTitle(point.owner || "")}
                            title={PointTitle}
                          >
                            {point.text}
                          </span>
                          {point.trigrams?.map(trigram => (
                            <span key={trigram} className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {trigram}
                            </span>
                          ))}
                          {isCR && (
                            <button
                              onClick={() => toggleNotes(point.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {point.showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                          <button
                            onClick={() => removeOdjPoint(point.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {isCR && point.showNotes && (
                        <textarea
                            className="w-full border border-gray-300 rounded p-2"
                            placeholder="Ajouter des notes..."
                            onChange={(e) => changeNotes(point.id, e.target.value)}
                            value={point.notes || ""}
                          >
                        </textarea>
                      )}
                      {/* Si showNotes ==  false, on affiche les notes actuelles en dessous en petit */}
                      {isCR && !point.showNotes && point.notes?.trim() && (
                        <div
                          className="bg-gray-100 p-2 rounded-lg"
                          onClick={() => toggleNotes(point.id)}
                        >
                          <span className="text-xs text-gray-500">
                            {point.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <input
                      type="text"
                      value={newOdjPoint}
                      onChange={(e) => setNewOdjPoint(e.target.value)}
                      placeholder="Nouveau point"
                      className="flex-1 px-2 py-1 text-sm border rounded"
                    />
                    <input
                      type="text"
                      value={newOdjTrigrams}
                      onChange={(e) => setNewOdjTrigrams(e.target.value)}
                      placeholder="NGE"
                      className="w-24 px-2 py-1 text-sm border rounded text-center uppercase"
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
                        <span
                          className="text-green-600"
                          onMouseOverCapture={() => changeTitle(decision.owner || "")}
                          title={PointTitle}
                        >{decision.text}</span>
                        {decision.trigrams?.map(trigram => (
                          <span key={trigram} className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded">
                            {trigram}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => removeDecision(decision.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <input
                      type="text"
                      value={newDecision}
                      onChange={(e) => setNewDecision(e.target.value)}
                      placeholder="Nouvelle décision"
                      className="flex-1 px-2 py-1 text-sm border rounded"
                    />
                    <input
                      type="text"
                      value={newDecisionTrigrams}
                      onChange={(e) => setNewDecisionTrigrams(e.target.value)}
                      placeholder="MRP / PSP"
                      className="w-24 px-2 py-1 text-sm border rounded text-center uppercase"
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
              <div className="flex flex-col items-center gap-4">
                {!showInput ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleButtonClick}
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Import className="w-4 h-4" />
                      Importer
                    </button>  
                    <button
                      onClick={handleExport}
                      className="bg-purple-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Exporter
                    </button>
                  </div>     
                ) : (
                  <div className="mt-2 flex flex-col items-center gap-3 w-full max-w-md">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="border border-gray-300 rounded-md p-2 w-full h-32"
                      placeholder="Saisir les points à aborder"
                    />
                    <button
                      onClick={handleSubmit}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm w-full"
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
              <Ticket className="text-indigo-600 w-6 h-6" />
            </div>
            <div className="space-y-4">
              {ticketMetrics.map((metric, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metric.icon}
                      <span className={`text-${metric.pendingTickets >= metric.redThreshold ? 'red' : metric.pendingTickets >= metric.yellowThreshold ? 'yellow' : 'green'}-600`}>
                        {metric.name}
                      </span>
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

          {/* Actualités */}
          <div className="bg-white p-4 text-center rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Actualités</h2>
              <div className="flex items-center gap-2">
                <Users className="text-indigo-600 w-6 h-6" />
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
                  <p className="font-medium max-w-full break-words">
                    {item.text}
                  </p>
                  <button
                    onClick={() => removeNews(item.id)}
                    className={`${
                      item.newsType === 'team' 
                        ? 'text-emerald-700 hover:text-emerald-900' 
                        : 'text-purple-700 hover:text-purple-900'
                    } ml-2 shrink-0`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="container flex flex-wrap items-center gap-2 mt-4">
                <input
                  type="text"
                  value={newNews}
                  onChange={(e) => setNewNews(e.target.value)}
                  placeholder="Nouvelle actualité"
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
                <select
                  value={newsType}
                  onChange={(e) => setNewsType(e.target.value as 'team' | 'hr')}
                  className="px-2 py-1 text-sm border rounded"
                  style={{ backgroundColor: newsType === 'team' ? '#10B981' : 'purple', color: 'white' }}
                >
                  <option value="team" style={{ backgroundColor: '#10B981', color: 'white' }} >Equipe</option>
                  <option value="hr" style={{ backgroundColor: 'purple', color: 'white' }} >RH</option>
                </select>
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