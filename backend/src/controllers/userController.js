const Subscription = require('../models/Subscription');

// GET /api/user/profile  - accessible to all logged-in users
exports.getProfile = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};

// GET /api/user/dashboard - accessible to all logged-in users
exports.getDashboard = async (req, res) => {
  const activeSub = await Subscription.findOne({
    user_id: req.user._id,
    status: 'active',
  }).populate('plan_id');

  res.status(200).json({
    message: `Welcome back, ${req.user.name}!`,
    plan: activeSub ? activeSub.plan_id.name : 'Free (no active subscription)',
  });
};

// GET /api/premium-content - only premium users (protected by requirePlan middleware)
exports.getPremiumContent = async (req, res) => {
  res.status(200).json({
    message: 'This is exclusive premium content.',
    data: ['Advanced analytics', 'Priority support', 'Unlimited storage'],
  });
};
