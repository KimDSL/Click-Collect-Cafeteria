const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ─────────────────────────────────────────────
// GET /api/products
// Retourne tous les produits disponibles (isAvailable = true)
// Le frontend filtre ensuite par catégorie (Tous / Plats / Boissons / Encas)
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    const filter = { isAvailable: true };
    if (category && category !== 'Tous') {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Erreur GET /api/products :', error.message);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────
// GET /api/products/all  (usage admin uniquement)
// Retourne TOUS les produits, y compris ceux en rupture
// ─────────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().sort({ category: 1, name: 1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────
// POST /api/products  (admin : ajouter un produit)
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/products/:id/availability  (admin : activer/désactiver)
// ─────────────────────────────────────────────
router.patch('/:id/availability', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit introuvable' });
    }
    product.isAvailable = !product.isAvailable;
    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
