require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
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
    
    const deletedProducts = await Product.deleteMany({});
    console.log(`${deletedProducts.deletedCount} produit(s) supprimé(s)`);
    
    const inserted = await Product.insertMany(defaultMenu);
    console.log(`${inserted.length} produits insérés.`);

    const riz = inserted.find(p => p.name === 'Riz sauce arachide');
    const sandwich = inserted.find(p => p.name === 'Sandwich Poulet');
    const bissap = inserted.find(p => p.name === 'Jus de Bissap');
    const eau = inserted.find(p => p.name === 'Eau Minérale');
    const beignets = inserted.find(p => p.name === 'Beignets');
    const cafe = inserted.find(p => p.name === 'Café');

    const deletedOrders = await Order.deleteMany({});
    console.log(`${deletedOrders.deletedCount} commande(s) supprimée(s)`);

    const testOrders = [
      {
        studentName: 'ADAMOU Fadilatou',
        studentId: '24ENS001',
        items: [
          { productId: sandwich._id, name: sandwich.name, price: sandwich.price, quantity: 1 },
          { productId: bissap._id, name: bissap.name, price: bissap.price, quantity: 1 }
        ],
        totalPrice: sandwich.price + bissap.price,
        status: 'En attente'
      },
      {
        studentName: 'KOFFI Koffi',
        studentId: '24ENS002',
        items: [
          { productId: riz._id, name: riz.name, price: riz.price, quantity: 2 },
          { productId: eau._id, name: eau.name, price: eau.price, quantity: 1 }
        ],
        totalPrice: riz.price * 2 + eau.price,
        status: 'Pret'
      },
      {
        studentName: 'TCHOUTA Marc',
        studentId: '24ENS003',
        items: [
          { productId: beignets._id, name: beignets.name, price: beignets.price, quantity: 3 },
          { productId: cafe._id, name: cafe.name, price: cafe.price, quantity: 1 }
        ],
        totalPrice: beignets.price * 3 + cafe.price,
        status: 'Termine'
      }
    ];

    await Order.create(testOrders);
    console.log('3 commandes de test insérées.');
    console.log('Seeding terminé avec succès !');
  } catch (error) {
    console.error('Erreur lors du seeding :', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDB();