const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAdmin } = require('../middleware/adminAuth');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
});

// Get user by Firebase UID
router.get('/firebase/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.uid }).populate('favorites');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// Create or update user (sync with Firebase)
router.post('/sync', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL } = req.body;

    if (!firebaseUid || !email || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    let user = await User.findOne({ firebaseUid });

    if (user) {
      // Update existing user
      user.email = email;
      user.displayName = displayName;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        firebaseUid,
        email,
        displayName,
        photoURL: photoURL || '',
      });
    }

    res.status(user.isNew ? 201 : 200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing user',
      error: error.message,
    });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
});

// Add book to favorites
router.post('/:id/favorites/:bookId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.favorites.includes(req.params.bookId)) {
      user.favorites.push(req.params.bookId);
      await user.save();
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding favorite',
      error: error.message,
    });
  }
});

// Remove book from favorites
router.delete('/:id/favorites/:bookId', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.favorites = user.favorites.filter(
      fav => fav.toString() !== req.params.bookId
    );
    await user.save();

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing favorite',
      error: error.message,
    });
  }
});

// Admin: Toggle user role
router.put('/admin/toggle-role/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${user.role}`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message,
    });
  }
});

// Admin: Toggle user active status
router.put('/admin/toggle-status/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message,
    });
  }
});

// Admin: Delete user
router.delete('/admin/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
});

// Admin: Create user manually
router.post('/admin/create', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, role, isActive } = req.body;

    if (!firebaseUid || !email || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firebaseUid, email, and displayName are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ firebaseUid }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this Firebase UID or email already exists',
      });
    }

    const user = await User.create({
      firebaseUid,
      email,
      displayName,
      photoURL: photoURL || '',
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
});

// Admin: Get statistics
router.get('/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        inactiveUsers: totalUsers - activeUsers,
        recentUsers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
});

module.exports = router;
