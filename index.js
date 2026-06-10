require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// ── Import des routes ──
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// ── Connexion à MongoDB ──
connectDB();

const app = express();

// ── Middlewares globaux ──
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // port Vite par défaut
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ── Route de santé (health check) ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Click & Collect Cafétéria API opérationnelle',
    timestamp: new Date().toISOString(),
  });
});

// ── Gestion des routes inconnues ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable` });
});

// ── Gestionnaire d'erreurs global ──
app.use((err, req, res, next) => {
  console.error('Erreur non gérée :', err.stack);
  res.status(500).json({ success: false, message: 'Erreur interne du serveur' });
});

// ── Démarrage du serveur ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📋 Environnement : ${process.env.NODE_ENV || 'development'}`);
});
