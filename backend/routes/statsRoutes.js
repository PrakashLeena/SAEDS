const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Activity = require('../models/Activity');

// GET /api/stats - public overview stats
router.get('/', async (req, res) => {
  try {
    const activeMembers = await User.countDocuments({ isActive: true });
    const eventsHosted = await Activity.countDocuments();

    return res.json({
      success: true,
      data: { activeMembers, eventsHosted },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
