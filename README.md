# 🚀 Vite React TypeScript Starter

## 📌 Description
Ce projet est une application **React + TypeScript** avec un serveur backend **Node.js (Express + Socket.io)**. Il utilise **Vite** pour un développement rapide et est configurable via des variables d'environnement.

## 📁 Structure du projet
```
├── dist/                 # Dossier de build
├── node_modules/         # Dépendances npm
├── public/               # Fichiers statiques
├── saves/                # Fichiers de sauvergarde
├── src/                  # Code source du frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── vite-env.d.ts
├── .env                  # Fichier des variables d'environnement
├── .gitignore            # Fichiers ignorés par Git
├── eslint.config.js      # Configuration ESLint
├── index.html            # Template HTML principal
├── package.json          # Gestion des dépendances et scripts
├── postcss.config.js     # Configuration PostCSS
├── README.md             # Documentation
├── server.js             # Serveur Node.js (Express + Socket.io)
├── tailwind.config.js    # Configuration Tailwind CSS
├── tsconfig.json         # Configuration TypeScript
├── vite.config.ts        # Configuration de Vite
```

## ⚙️ Installation
### 1️⃣ Cloner le projet
```sh
git clone https://github.com/maxenceRP/dashboard-reunion.git
cd dashboard-reunion
```

### 2️⃣ Installer les dépendances
```sh
npm install
```

### 3️⃣ Configurer les variables d'environnement
Créer un fichier `.env` à la racine du projet et y ajouter :
```
# Variables pour le serveur
HOST=10.0.0.113
SOCKET_PORT=3000
VITE_PORT=3001
```

### 4️⃣ Changer la valeur des variables IP et PORT dans le fichier App.tsx

Dans le fichier `src/App.tsx`, les variables `IP` et `PORT` sont utilisées pour configurer l'adresse de votre serveur Socket.io.

### Étapes pour changer l'IP et le PORT :

1. Ouvrez le fichier `src/App.tsx` dans votre éditeur de code.

2. Recherchez ces lignes dans le fichier :

   ```tsx
   var IP = '10.0.0.113';  // Adresse IP du serveur
   var PORT = '3000';       // Port du serveur
   const socket = io(`http://${IP}:${PORT}`);


### 5️⃣​ Lancer le serveur et l'application
#### ➤ Mode développement
```sh
npm run dev  # Lance Vite (frontend)
npm run socket  # Démarre le serveur backend
```
#### ➤ Mode production
```sh
npm run deploy  # Build du frontend + lancement du serveur
```

## 🛠️ Technologies utilisées
- **React** (Frontend)
- **Vite** (Bundler rapide)
- **TypeScript** (Typage statique)
- **Tailwind CSS** (Styling rapide)
- **Express** (Backend)
- **Socket.io** (Communication en temps réel)
- **dotenv** (Gestion des variables d'environnement)
