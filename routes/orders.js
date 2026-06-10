const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

// ─────────────────────────────────────────────
// POST /api/orders
// Crée une nouvelle commande depuis le panier du client
// Body attendu :
// {
//   "studentName": "ADAMOU Fadilatou",
//   "studentId": "24ENS001",          ← optionnel (matricule)
//   "items": [
//     { "productId": "xxx", "quantity": 2 },
//     { "productId": "yyy", "quantity": 1 }
//   ]
// }
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { studentName, studentId, items } = req.body;

    if (!studentName || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nom étudiant et articles sont requis',
      });
    }

    // Récupérer les produits depuis la BDD pour valider les prix
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isAvailable: true });

    if (products.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'Un ou plusieurs produits sont invalides ou indisponibles',
      });
    }

    // Construire les items avec snapshot (nom + prix du moment)
    let totalPrice = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      const subtotal = product.price * item.quantity;
      totalPrice += subtotal;
      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    const order = await Order.create({
      studentName,
      studentId: studentId || '',
      items: orderItems,
      totalPrice,
    });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        ticketNumber: order.ticketNumber,
        totalPrice: order.totalPrice,
        status: order.status,
        _id: order._id,
      },
    });
  } catch (error) {
    console.error('Erreur POST /api/orders :', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders
// Retourne toutes les commandes pour le tableau de bord admin
// Query params optionnels : ?status=En attente | Pret | Termine
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'Toutes') {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Stats pour les compteurs du dashboard (Total / En attente / Prêts / Terminées)
    const stats = {
      total: await Order.countDocuments(),
      enAttente: await Order.countDocuments({ status: 'En attente' }),
      prets: await Order.countDocuments({ status: 'Pret' }),
      terminees: await Order.countDocuments({ status: 'Termine' }),
    };

    res.status(200).json({
      success: true,
      stats,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Erreur GET /api/orders :', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/orders/:id/status
// Met à jour le statut d'une commande
// Transitions autorisées : En attente → Pret → Termine
// Body : { "status": "Pret" }
// ─────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const VALID_STATUSES = ['En attente', 'Pret', 'Termine'];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Statut invalide. Valeurs acceptées : ${VALID_STATUSES.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }

    // Vérification de la transition logique
    const transitions = {
      'En attente': 'Pret',
      Pret: 'Termine',
    };

    if (order.status === 'Termine') {
      return res.status(400).json({
        success: false,
        message: 'Cette commande est déjà terminée',
      });
    }

    if (transitions[order.status] !== status) {
      return res.status(400).json({
        success: false,
        message: `Transition invalide : ${order.status} → ${status}. Attendu : ${transitions[order.status]}`,
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Commande passée à "${status}"`,
      data: order,
    });
  } catch (error) {
    console.error('Erreur PATCH /api/orders/:id/status :', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders/:id
// Récupère le détail d'une commande (par ex. après checkout pour afficher le ticket)
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
