const express = require('express');
const {
  subscribe,
  upgradePlan,
  getMySubscription,
  cancelSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all subscription routes require login

router.post('/subscribe', subscribe);
router.put('/upgrade-plan', upgradePlan);
router.get('/me', getMySubscription);
router.post('/cancel-subscription', cancelSubscription);

module.exports = router;
