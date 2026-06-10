const mongoose = require('mongoose');

// Emojis par défaut selon la catégorie (correspond aux icônes visibles dans le frontend)
const CATEGORY_EMOJI = {
  Plat: '🍽️',
  Boisson: '🥤',
  Encas: '🥪',
};

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Le prix du produit est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    category: {
      type: String,
      enum: ['Plat', 'Boisson', 'Encas'],
      default: 'Plat',
    },
    // Emoji affiché sur la ProductCard côté frontend
    emoji: {
      type: String,
      default: '🍽️',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);
