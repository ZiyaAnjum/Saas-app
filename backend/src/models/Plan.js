const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Free, Basic, Premium
    price: { type: Number, required: true, default: 0 },
    features: { type: [String], default: [] },
    accessLevel: { type: String, enum: ['free', 'basic', 'premium'], required: true },
    storageLimitGB: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
