require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// ── Menu par défaut visible dans les captures d'écran ──
// On retrouve : Riz sauce arachide, Sandwich Poulet, Jus de Gingembre,
// Haricots Mijoté, Poulet DG, Eau Minérale, etc.
const defaultMenu = [
  // ── PLATS ──────────────────────────────────────
  {
    name: 'Riz sauce arachide',
    price: 500,
    category: 'Plat',
    emoji: '🍛',
    isAvailable: true,
  },
  {
    name: 'Haricots Mijoté',
    price: 450,
    category: 'Plat',
    emoji: '🫘',
    isAvailable: true,
  },
  {
    name: 'Poulet DG',
    price: 700,
    category: 'Plat',
    emoji: '🍗',
    isAvailable: true,
  },
  {
    name: 'Riz Sauté aux Légumes',
    price: 400,
    category: 'Plat',
    emoji: '🥘',
    isAvailable: true,
  },
  {
    name: 'Poisson Braisé',
    price: 600,
    category: 'Plat',
    emoji: '🐟',
    isAvailable: true,
  },

  // ── BOISSONS ────────────────────────────────────
  {
    name: 'Jus de Gingembre',
    price: 200,
    category: 'Boisson',
    emoji: '🧃',
    isAvailable: true,
  },
  {
    name: 'Eau Minérale',
    price: 150,
    category: 'Boisson',
    emoji: '💧',
    isAvailable: true,
  },
  {
    name: 'Café',
    price: 100,
    category: 'Boisson',
    emoji: '☕',
    isAvailable: true,
  },
  {
    name: 'Jus de Bissap',
    price: 200,
    category: 'Boisson',
    emoji: '🥤',
    isAvailable: true,
  },

  // ── ENCAS ────────────────────────────────────
  {
    name: 'Sandwich Poulet',
    price: 350,
    category: 'Encas',
    emoji: '🥪',
    isAvailable: true,
  },
  {
    name: 'Omelette',
    price: 250,
    category: 'Encas',
    emoji: '🍳',
    isAvailable: true,
  },
  {
    name: 'Beignets',
    price: 100,
    category: 'Encas',
    emoji: '🧆',
    isAvailable: true,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Supprimer les produits existants pour repartir proprement
    const deleted = await Product.deleteMany({});
    console.log(`🗑️  ${deleted.deletedCount} produit(s) supprimé(s)`);

    // Insérer le menu par défaut
    const inserted = await Product.insertMany(defaultMenu);
    console.log(`✅ ${inserted.length} produits insérés dans la base de données :\n`);

    inserted.forEach((p) =>
      console.log(`   ${p.emoji}  ${p.name.padEnd(25)} ${p.price} FCFA  [${p.category}]`)
    );

    console.log('\n🎉 Seeding terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

seedDB();
