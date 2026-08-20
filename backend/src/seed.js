// Seeds the database with the three default plans (Free, Basic, Premium)
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const Plan = require('./models/Plan');

const plans = [
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

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Plan.deleteMany({});
    await Plan.insertMany(plans);
    console.log('Plans seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
})();
