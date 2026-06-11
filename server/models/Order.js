const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, "Le nom de l'étudiant est requis"],
    trim: true,
  },
  studentId: {
    type: String,
    required: [true, 'Le matricule est requis'],
    trim: true,
    uppercase: true,
    match: [/^\d{2}[A-Z]{5}\d{4}$/, 'Format du matricule invalide (ex: 23ENSPM0426)'],
  },
  ticketNumber: { type: String, unique: true },
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
    min: 0,
  },
  status: {
    type: String,
    enum: ['En attente', 'Pret', 'Termine'],
    default: 'En attente',
  },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const rL = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join('');
    const rD = Array.from({ length: 3 }, () => digits[Math.floor(Math.random() * 10)]).join('');
    this.ticketNumber = `#${rL}${rD}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);