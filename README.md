# Click & Collect Cafétéria ENSPM — Backend

API REST Node.js / Express / MongoDB pour le système de commande Click & Collect.

## Prérequis

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) installé et lancé localement

---

## Installation

```bash
# 1. Se placer dans le dossier server
cd server

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration
cp .env.example .env
# Éditer .env si nécessaire (port, URI MongoDB)
```

---

## Initialiser la base de données

```bash
npm run seed
```

Cette commande injecte le menu par défaut (plats, boissons, encas) dans MongoDB.

---

## Lancer le serveur

```bash
# Mode développement (rechargement automatique)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur **http://localhost:5000**

---

## Routes API

### Produits

| Méthode | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/products` | Tous les produits disponibles |
| `GET` | `/api/products?category=Plat` | Produits filtrés par catégorie |
| `GET` | `/api/products/all` | Tous les produits (admin) |
| `POST` | `/api/products` | Ajouter un produit |
| `PATCH` | `/api/products/:id/availability` | Activer / désactiver un produit |

### Commandes

| Méthode | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/orders` | Créer une commande (depuis le panier) |
| `GET` | `/api/orders` | Toutes les commandes (dashboard admin) |
| `GET` | `/api/orders?status=En attente` | Commandes filtrées par statut |
| `GET` | `/api/orders/:id` | Détail d'une commande |
| `PATCH` | `/api/orders/:id/status` | Changer le statut d'une commande |

### Statuts de commande (transitions)

```
En attente  →  Pret  →  Termine
```

---

## Exemple : Créer une commande

```json
POST /api/orders
{
  "studentName": "ADAMOU Fadilatou",
  "studentId": "24ENS001",
  "items": [
    { "productId": "<id_produit>", "quantity": 1 },
    { "productId": "<id_produit>", "quantity": 2 }
  ]
}
```

Réponse :
```json
{
  "success": true,
  "message": "Commande créée avec succès",
  "data": {
    "ticketNumber": "#ABC123",
    "totalPrice": 1000,
    "status": "En attente"
  }
}
```

---

## Exemple : Changer le statut

```json
PATCH /api/orders/:id/status
{ "status": "Pret" }
```

---

## Structure du projet

```
server/
├── config/
│   └── db.js            ← Connexion MongoDB
├── models/
│   ├── Product.js       ← Modèle produit
│   └── Order.js         ← Modèle commande
├── routes/
│   ├── products.js      ← Routes /api/products
│   └── orders.js        ← Routes /api/orders
├── index.js             ← Point d'entrée Express
├── seed.js              ← Script de peuplement BDD
├── .env.example         ← Variables d'environnement
└── package.json
```
