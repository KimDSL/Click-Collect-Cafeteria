const mongoose = require('mongoose');

// Sous-schéma pour chaque article dans le panier
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // Snapshot du nom au moment de la commande
    // (évite les incohérences si le produit est renommé plus tard)
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'La quantité minimale est 1'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Nom + matricule de l'étudiant (ex: "ADAMOU Fadilatou")
    studentName: {
      type: String,
      required: [true, 'Le nom de l\'étudiant est requis'],
      trim: true,
    },
    // Matricule visible sur les cartes du dashboard (ex: #ABC123)
    studentId: {
      type: String,
      trim: true,
      default: '',
    },
    // Numéro de ticket généré automatiquement (ex: #ABC123)
    ticketNumber: {
      type: String,
      unique: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'La commande doit contenir au moins un article',
      },
    },
    totalPrice: {
      type: Number,
      required: [true, 'Le montant total est requis'],
      min: [0, 'Le total ne peut pas être négatif'],
    },
    // Statuts conformes au cahier des charges + frontend
    status: {
      type: String,
      enum: ['En attente', 'Pret', 'Termine'],
      default: 'En attente',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // on gère createdAt manuellement
  }
);

// ── Génération automatique du numéro de ticket avant sauvegarde ──
orderSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    // Format : # + 3 lettres aléatoires + 3 chiffres  →  ex: #ABC123
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const randomLetters = Array.from({ length: 3 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join('');
    const randomDigits = Array.from({ length: 3 }, () =>
      digits[Math.floor(Math.random() * digits.length)]
    ).join('');
    this.ticketNumber = `#${randomLetters}${randomDigits}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
