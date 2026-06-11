const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().sort({ category: 1, name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch('/:id/availability', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
