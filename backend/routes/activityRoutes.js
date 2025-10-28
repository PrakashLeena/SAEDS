const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Get all activities with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, status, upcoming } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter upcoming events
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'upcoming';
    }

    const activities = await Activity.find(query)
      .sort({ date: 1 })
      .populate('registeredUsers', 'displayName email photoURL');

    res.json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activities',
      error: error.message,
    });
  }
});

// Get single activity by ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('registeredUsers', 'displayName email photoURL');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
      error: error.message,
    });
  }
});

// Create new activity
router.post('/', async (req, res) => {
  try {
    // Ensure image has a sensible default if client didn't supply one (handles empty string)
    const payload = { ...req.body };
    if (!payload.image) {
      payload.image = 'https://via.placeholder.com/600x400?text=Activity+Image';
    }

    const activity = await Activity.create(payload);

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating activity',
      error: error.message,
    });
  }
});

// Update activity
router.put('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating activity',
      error: error.message,
    });
  }
});

// Delete activity
router.delete('/:id', async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting activity',
      error: error.message,
    });
  }
});

// Register user for activity
router.post('/:id/register/:userId', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    // Check if activity is full
    if (activity.capacity > 0 && activity.registered >= activity.capacity) {
      return res.status(400).json({
        success: false,
        message: 'Activity is full',
      });
    }

    // Check if user is already registered
    if (activity.registeredUsers.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'User already registered',
      });
    }

    activity.registeredUsers.push(req.params.userId);
    activity.registered = activity.registeredUsers.length;
    await activity.save();

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering for activity',
      error: error.message,
    });
  }
});

// Unregister user from activity
router.delete('/:id/register/:userId', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }

    activity.registeredUsers = activity.registeredUsers.filter(
      user => user.toString() !== req.params.userId
    );
    activity.registered = activity.registeredUsers.length;
    await activity.save();

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unregistering from activity',
      error: error.message,
    });
  }
});

module.exports = router;
