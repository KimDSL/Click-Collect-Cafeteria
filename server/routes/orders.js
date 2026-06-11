const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');

router.post('/', async (req, res) => {
  try {
    const { studentName, studentId, items } = req.body;
    if (!studentName || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const enrichedItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Produit ${item.productId} introuvable` });
      }
      enrichedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      });
      totalPrice += product.price * item.quantity;
    }

    const order = await Order.create({ studentName, studentId, items: enrichedItems, totalPrice });

    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès',
      data: {
        ticketNumber: order.ticketNumber,
        totalPrice: order.totalPrice,
        status: order.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowed = ['En attente', 'Pret', 'Termine'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Statut invalide' });
  }
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
