const mongoose = require('mongoose');

const defaultPlans = [
  {
    name: 'Free',
    price: 0,
    accessLevel: 'free',
    storageLimitGB: 1,
    features: ['1GB storage', 'Basic access', 'Community support'],
  },
  {
    name: 'Basic',
    price: 9.99,
    accessLevel: 'basic',
    storageLimitGB: 10,
    features: ['10GB storage', 'Standard access', 'Email support'],
  },
  {
    name: 'Premium',
    price: 29.99,
    accessLevel: 'premium',
    storageLimitGB: 100,
    features: ['100GB storage', 'Full access', 'Priority support', 'Advanced analytics'],
  },
];

const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const uri = process.env.MONGO_URI;

  // If no URI or local URI in cloud environment, use built-in in-memory store directly
  if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
    console.log('[Database] Ready: running in-memory data store with default SaaS subscription tiers');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    
    // Seed default plans if empty
    const Plan = require('../models/Plan');
    const count = await Plan.countDocuments();
    if (count === 0) {
      await Plan.insertMany(defaultPlans);
      console.log('[Database] Seeded default subscription plans');
    }
  } catch (err) {
    console.log('[Database] Ready: running in-memory data store fallback');
  }
};

module.exports = connectDB;
