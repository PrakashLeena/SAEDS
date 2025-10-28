const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const User = require('../models/User');

// List members
router.get('/', async (req, res) => {
  try {
    const members = await Member.find().sort({ joinedAt: -1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list members', error: err.message });
  }
});

// Create member (admin)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, photoURL, notes, createdByFirebaseUid } = req.body || {};
    if (!name || !email) return res.status(400).json({ success: false, message: 'name and email required' });

    let createdBy = null;
    if (createdByFirebaseUid) {
      const user = await User.findOne({ firebaseUid: createdByFirebaseUid });
      if (user) createdBy = user._id;
    }

    const member = new Member({ name, email, phone: phone || '', photoURL: photoURL || '', notes: notes || '', createdBy });
    await member.save();
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create member', error: err.message });
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update member', error: err.message });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete member', error: err.message });
  }
});

module.exports = router;
