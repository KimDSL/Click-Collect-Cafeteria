const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { normalizeMatricule, isValidMatricule, escapeRegex } = require('../utils/matricule');

router.post('/', async (req, res) => {
  try {
    const { studentName, studentId, items } = req.body;
    if (!studentName || !studentId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Données manquantes' });
    }

    const matricule = normalizeMatricule(studentId);
    if (!isValidMatricule(matricule)) {
      return res.status(400).json({
        success: false,
        message: 'Format du matricule invalide. Le format doit être du type : 23ENSPM0426.',
      });
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

    const order = await Order.create({
      studentName: studentName.trim(),
      studentId: matricule,
      items: enrichedItems,
      totalPrice,
    });

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

router.get('/ticket/:ticketNumber', async (req, res) => {
  try {
    let ticket = req.params.ticketNumber.trim().toUpperCase();
    if (!ticket.startsWith('#')) ticket = `#${ticket}`;

    const order = await Order.findOne({ ticketNumber: ticket });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Ticket introuvable.' });
    }
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.studentId) {
      const matricule = normalizeMatricule(req.query.studentId);
      if (!isValidMatricule(matricule)) {
        return res.status(400).json({ success: false, message: 'Matricule invalide' });
      }
      filter.studentId = { $regex: new RegExp('^' + escapeRegex(matricule) + '$', 'i') };
    }

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
