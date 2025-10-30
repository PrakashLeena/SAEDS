const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');

// Get all achievements (public)
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data: achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch achievements', error: err.message });
  }
});

// Get all achievements including inactive (admin)
router.get('/all', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ order: 1 });
    res.json({ success: true, data: achievements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch achievements', error: err.message });
  }
});

// Get single achievement
router.get('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }
    res.json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch achievement', error: err.message });
  }
});

// Create achievement (admin)
router.post('/', async (req, res) => {
  try {
    const { title, description, icon, value, category, order, isActive } = req.body;
    
    if (!title || !description || !value) {
      return res.status(400).json({ success: false, message: 'Title, description, and value are required' });
    }

    // Get max order if not provided
    let achievementOrder = order;
    if (achievementOrder === undefined) {
      const maxOrderAchievement = await Achievement.findOne().sort({ order: -1 }).select('order');
      achievementOrder = maxOrderAchievement ? (maxOrderAchievement.order || 0) + 1 : 0;
    }

    const achievement = new Achievement({
      title,
      description,
      icon: icon || 'trophy',
      value,
      category: category || 'general',
      order: achievementOrder,
      isActive: isActive !== undefined ? isActive : true
    });

    await achievement.save();
    res.status(201).json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create achievement', error: err.message });
  }
});

// Update achievement (admin)
router.put('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }
    
    res.json({ success: true, data: achievement });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update achievement', error: err.message });
  }
});

// Delete achievement (admin)
router.delete('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }
    
    res.json({ success: true, message: 'Achievement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete achievement', error: err.message });
  }
});

module.exports = router;
