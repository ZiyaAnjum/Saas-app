const Subscription = require('../models/Subscription');

// Restricts a route to users with an active subscription matching one of the allowed access levels.
// Usage: requirePlan(['premium'])  -> only premium users
//        requirePlan(['basic', 'premium']) -> paid users (any tier above free)
exports.requirePlan = (allowedLevels = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      const activeSub = await Subscription.findOne({
        user_id: user._id,
        status: 'active',
      }).populate('plan_id');

      const accessLevel = activeSub ? activeSub.plan_id.accessLevel : 'free';

      if (!allowedLevels.includes(accessLevel)) {
        return res.status(403).json({
          message: `Access denied. This route requires one of the following plans: ${allowedLevels.join(', ')}`,
        });
      }

      req.subscription = activeSub;
      next();
    } catch (error) {
      return res.status(500).json({ message: 'Server error while checking plan access' });
    }
  };
};
