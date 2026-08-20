const express = require('express');
const { getProfile, getDashboard, getPremiumContent } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requirePlan } = require('../middleware/roleGuard');

const router = express.Router();

router.get('/profile', protect, getProfile);       // all logged-in users
router.get('/dashboard', protect, getDashboard);    // all logged-in users
router.get('/premium-content', protect, requirePlan(['premium']), getPremiumContent); // premium only

module.exports = router;
