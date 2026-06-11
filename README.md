# Click & Collect Cafétéria ENSPM

Application Full-Stack (React / Express / MongoDB) pour la gestion de commandes en ligne et retrait avec paiement physique.

---

## Structure du Projet

- **`/client`** : Application Front-End construite avec React, Vite et Lucide Icons.
- **`/server`** : API REST Back-End construite avec Node.js, Express et Mongoose (MongoDB).

---

## Prérequis

Assurez-vous d'avoir installé sur votre machine :
- [Node.js](https://nodejs.org/) (version 18+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) lancé localement sur le port par défaut (27017)

---

## Installation et Configuration

### 1. Cloner le projet et installer les dépendances
À la racine du projet, exécutez la commande suivante pour installer les dépendances du client et du serveur :
```bash
npm run install:all
```

### 2. Configurer les variables d'environnement
Dans le dossier `/server`, créez un fichier `.env` à partir du modèle :
```bash
cd server
cp .env.example .env
```
Le fichier `.env` par défaut contient :
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cafeteria_enspm
CLIENT_URL=http://localhost:5173
```
Vous pouvez modifier ces valeurs selon votre configuration.

---

## Initialiser la Base de Données

Pour insérer le menu par défaut (plats, boissons, encas) dans MongoDB, lancez le script de peuplement depuis le dossier racine :
```bash
npm run seed
```

---

## Lancement de l'Application

Vous devez démarrer le serveur (Back-End) et l'application (Front-End).

### Démarrer le Serveur Back-End
Depuis la racine :
```bash
npm run dev:server
```
Le serveur démarrera sur **http://localhost:5000**.

### Démarrer le Client Front-End
Depuis la racine :
```bash
npm run dev:client
```
L'application React sera accessible sur **http://localhost:5173**.

---

## API Routes

### Produits
- `GET /api/products` : Liste des produits disponibles (isAvailable: true).
- `GET /api/products/all` : Liste complète des produits pour le gérant.
- `POST /api/products` : Ajouter un produit au catalogue.
- `PATCH /api/products/:id/availability` : Activer/Désactiver la disponibilité d'un produit.

### Commandes
- `POST /api/orders` : Créer une commande (avec snapshot nom et prix des produits).
- `GET /api/orders` : Liste de toutes les commandes pour le gérant (AdminDashboard).
- `PATCH /api/orders/:id/status` : Mettre à jour le statut d'une commande (En attente -> Pret -> Termine).
