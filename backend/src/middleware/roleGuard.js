const Subscription = require('../models/Subscription');

// Restricts a route to users with an active subscription matching one of the allowed access levels.
// Usage: requirePlan(['premium'])  -> only premium users
//        requirePlan(['basic', 'premium']) -> paid users (any tier above free)
exports.requirePlan = (allowedLevels = ['premium']) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const activeSub = await Subscription.findOne({
        user_id: user._id,
        status: 'active',
      }).populate('plan_id');

      let accessLevel = 'free';
      if (activeSub && activeSub.plan_id) {
        accessLevel = activeSub.plan_id.accessLevel || activeSub.plan_id.name?.toLowerCase() || 'free';
      } else if (user.current_plan) {
        accessLevel = user.current_plan.accessLevel || user.current_plan.name?.toLowerCase() || 'free';
      }

      if (!allowedLevels.includes(accessLevel.toLowerCase())) {
        return res.status(403).json({
          message: `Access forbidden: This route requires one of the following subscription plans: [${allowedLevels.join(', ')}]. Your current access level is '${accessLevel}'.`,
          currentPlan: accessLevel,
          requiredPlans: allowedLevels,
        });
      }

      req.subscription = activeSub;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error while verifying subscription access', error: error.message });
    }
  };
};

// Convenience middleware for paid routes (basic or premium)
exports.requirePaid = exports.requirePlan(['basic', 'premium']);

