const express = require('express');
const { getPlans, createPlan } = require('../controllers/planController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getPlans); // public - anyone can view available plans
router.post('/', protect, createPlan); // admin utility

module.exports = router;
