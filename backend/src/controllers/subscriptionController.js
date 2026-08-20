const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');

// POST /api/subscriptions/subscribe
exports.subscribe = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Cancel any existing active subscription before starting a new one
    await Subscription.updateMany(
      { user_id: userId, status: 'active' },
      { $set: { status: 'cancelled', end_date: new Date() } }
    );

    const subscription = await Subscription.create({
      user_id: userId,
      plan_id: planId,
      start_date: new Date(),
      status: 'active',
    });

    await User.findByIdAndUpdate(userId, { current_plan: planId });

    res.status(201).json({ message: 'Subscribed successfully', subscription });
  } catch (error) {
    res.status(500).json({ message: 'Subscription failed', error: error.message });
  }
};

// PUT /api/subscriptions/upgrade-plan
exports.upgradePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    const newPlan = await Plan.findById(planId);
    if (!newPlan) return res.status(404).json({ message: 'Plan not found' });

    const activeSub = await Subscription.findOne({ user_id: userId, status: 'active' });
    if (!activeSub) {
      return res.status(400).json({ message: 'No active subscription found. Please subscribe first.' });
    }

    activeSub.status = 'cancelled';
    activeSub.end_date = new Date();
    await activeSub.save();

    const newSub = await Subscription.create({
      user_id: userId,
      plan_id: planId,
      start_date: new Date(),
      status: 'active',
    });

    await User.findByIdAndUpdate(userId, { current_plan: planId });

    res.status(200).json({ message: 'Plan updated successfully', subscription: newSub });
  } catch (error) {
    res.status(500).json({ message: 'Plan update failed', error: error.message });
  }
};

// GET /api/subscriptions/me
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user_id: req.user._id,
      status: 'active',
    }).populate('plan_id');

    if (!subscription) {
      return res.status(200).json({ message: 'No active subscription', subscription: null });
    }

    res.status(200).json({ subscription });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subscription', error: error.message });
  }
};

// POST /api/subscriptions/cancel-subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const activeSub = await Subscription.findOne({ user_id: req.user._id, status: 'active' });
    if (!activeSub) {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }

    activeSub.status = 'cancelled';
    activeSub.end_date = new Date();
    await activeSub.save();

    await User.findByIdAndUpdate(req.user._id, { current_plan: null });

    res.status(200).json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Cancellation failed', error: error.message });
  }
};
