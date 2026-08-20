const Plan = require('../models/Plan');

// GET /api/plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plans', error: error.message });
  }
};

// POST /api/plans  (admin utility - used by the seed script / admin panel)
exports.createPlan = async (req, res) => {
  try {
    const { name, price, features, accessLevel, storageLimitGB } = req.body;
    const plan = await Plan.create({ name, price, features, accessLevel, storageLimitGB });
    res.status(201).json({ plan });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create plan', error: error.message });
  }
};
