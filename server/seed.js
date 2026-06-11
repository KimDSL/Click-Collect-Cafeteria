require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const defaultMenu = [
  { name: 'Riz sauce arachide', price: 500, category: 'Plat', emoji: '🍛', isAvailable: true },
  { name: 'Haricots Mijoté', price: 450, category: 'Plat', emoji: '🫘', isAvailable: true },
  { name: 'Poulet DG', price: 700, category: 'Plat', emoji: '🍗', isAvailable: true },
  { name: 'Riz Sauté aux Légumes', price: 400, category: 'Plat', emoji: '🥘', isAvailable: true },
  { name: 'Poisson Braisé', price: 600, category: 'Plat', emoji: '🐟', isAvailable: true },
  { name: 'Jus de Gingembre', price: 200, category: 'Boisson', emoji: '🧃', isAvailable: true },
  { name: 'Eau Minérale', price: 150, category: 'Boisson', emoji: '💧', isAvailable: true },
  { name: 'Café', price: 100, category: 'Boisson', emoji: '☕', isAvailable: true },
  { name: 'Jus de Bissap', price: 200, category: 'Boisson', emoji: '🥤', isAvailable: true },
  { name: 'Sandwich Poulet', price: 350, category: 'Encas', emoji: '🥪', isAvailable: true },
  { name: 'Omelette', price: 250, category: 'Encas', emoji: '🍳', isAvailable: true },
  { name: 'Beignets', price: 100, category: 'Encas', emoji: '🧆', isAvailable: true },
];

const seedDB = async () => {
  try {
    await connectDB();
    const deleted = await Product.deleteMany({});
    console.log(`${deleted.deletedCount} produit(s) supprimé(s)`);
    const inserted = await Product.insertMany(defaultMenu);
    console.log(`${inserted.length} produits insérés :`);
    inserted.forEach((p) => console.log(`  ${p.emoji}  ${p.name.padEnd(25)} ${p.price} FCFA  [${p.category}]`));
    console.log('Seeding terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du seeding :', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDB();