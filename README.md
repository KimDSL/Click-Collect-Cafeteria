# Click & Collect Cafétéria ENSPM

Application Full-Stack (React / Express / MongoDB) pour la gestion de commandes en ligne, retrait et encaissement physique.

---

## Structure du Projet

- **`/client`** : Frontend React (Vite) — pages, composants, hooks et utilitaires.
- **`/server`** : Backend Express — routes, modèles Mongoose et utilitaires.

## Architecture du Projet

L'architecture suit un découpage simple frontend / backend avec des dossiers dédiés :

```
Click-Collect-Cafeteria/
├─ client/             # Application React (Vite)
│  ├─ src/
│  │  ├─ components/   # Composants réutilisables (Navbar, Cart, ProductCard...)
│  │  ├─ pages/        # Pages (Menu, AdminDashboard, LoginPortal)
│  │  ├─ context/      # Providers et hooks de contexte (CartContext)
│  │  ├─ hooks/        # Appels API centralisés (useApi.js)
│  │  ├─ utils/        # Utilitaires (matricule.js)
│  │  └─ main.jsx
│  └─ package.json
├─ server/             # API REST (Express + Mongoose)
│  ├─ models/          # Schémas Mongoose (Order, Product)
│  ├─ routes/          # Routes Express (/products, /orders)
│  ├─ utils/           # Utilitaires partagés (matricule.js)
│  └─ seed.js
├─ README.md
└─ package.json
```

Points clés :
- `client/src/hooks/useApi.js` centralise les appels HTTP vers `/api`.
- `server/routes/orders.js` contient la logique de création, recherche (par ticket) et filtrage sécurisé par `studentId`.
- `server/models/Order.js` stocke un snapshot des articles au moment de la commande (nom, prix, quantité).


---

## Prérequis

Installez sur votre machine :
- `Node.js`
- `MongoDB` (instance locale)

---

## Installation rapide

1. Installer les dépendances (client + server) :
```bash
npm run install:all
```

2. Créer le fichier d'environnement pour le serveur :
```bash
cd server
cp .env.example .env
```

3. Peupler la base de données (données de test) :
```bash
npm run seed
```

---

## Démarrage

Démarrer le serveur :
```bash
npm run dev:server
```
Démarrer le client :
```bash
npm run dev:client
```

---

## Principales fonctionnalités

- Flux étudiant : sélectionner des articles, finaliser la commande (nom + matricule), recevoir un numéro de ticket.
- Flux admin : tableau de bord avec gestion du menu et des commandes, encaissement par code ticket (recherche et validation du paiement).
- Validation stricte du matricule (format `23ENSPM0426`) côté client et serveur.
- Reconstitution immuable des articles d'une commande (snapshot des noms/prix au moment de la commande).

---

## Routes API (sélection)

### Produits
- `GET /api/products` — Produits disponibles (isAvailable = true).
- `GET /api/products/all` — Tous les produits (admin).
- `POST /api/products` — Ajouter un produit.
- `PATCH /api/products/:id/availability` — Basculer disponibilité.
- `DELETE /api/products/:id` — Supprimer un produit.

### Commandes
- `POST /api/orders` — Créer une commande (body : `studentName`, `studentId`, `items` [{productId, quantity}]). Le serveur valide le matricule et stocke `studentId` normalisé.
- `GET /api/orders` — Récupération filtrée : si `studentId` est fourni (`/api/orders?studentId=23ENSPM0426`) renvoie uniquement les commandes de cet étudiant; sinon renvoie toutes les commandes (usage admin).
- `GET /api/orders/ticket/:ticketNumber` — Recherche d'une commande par numéro de ticket (ex. `#ABC123`).
- `PATCH /api/orders/:id/status` — Mettre à jour le statut (`En attente`, `Pret`, `Termine`).
- `DELETE /api/orders/:id` — Annuler une commande (seules les commandes `En attente` peuvent être supprimées).

---

## Flux et usages importants

- Étudiant — Mes Commandes :
	- L'étudiant saisit son matricule (format validé) dans l'onglet `Mes Commandes` pour voir uniquement ses propres commandes.
	- Modifier/Annuler : l'interface permet de charger les articles d'une commande dans le panier (modification) ou d'annuler si `En attente`.

- Admin — Encaissement :
	- L'admin saisit le `ticketNumber` dans l'onglet `Commandes` pour retrouver la commande et valider le paiement (passage au statut `Termine`).

---

## Tests manuels suggérés

- Créer une commande avec matricule invalide (ex. `12345`) → réponse d'erreur.
- Créer une commande avec matricule valide (`23ENSPM0426`) → succès et ticket (ex. `#XYZ789`). Vérifier que le `totalPrice` sur le ticket correspond correctement.
- En admin : rechercher un ticket via `Encaissement` → afficher la commande et valider le paiement.
- Admin : ajouter/masquer/supprimer un produit via la gestion du menu.

---

## Notes de développement

- L'utilitaire de matricule est partagé côté serveur (`server/utils/matricule.js`) et côté client (`client/src/utils/matricule.js`).
- Le schéma `Order` exige désormais `studentId` et applique une regex de validation.
- Pour recharger les données de test avec les matricules fournis, exécuter :
```bash
node server/seed.js
```

## Clonnage du projet

Clonner le projet avec l'URL https://github.com/KimDSL/Click-Collect-Cafeteria.git
