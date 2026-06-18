const express = require('express');
const router = express.Router();

const { getLeaderboard } = require('../controllers/premiumController');
const authMiddleware = require('../middleware/authMiddleware');
const premiumMiddleware = require('../middleware/premiumMiddleware');

// Order matters: authenticate first (populates req.user),
// THEN check premium status.
router.use(authMiddleware);
router.use(premiumMiddleware);

router.get('/leaderboard', getLeaderboard);

module.exports = router;