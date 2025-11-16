const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const User = require('../models/User');

// List members
router.get('/', async (req, res) => {
  try {
    // Sort by order field (ascending), then by joinedAt (descending) as fallback
    const members = await Member.find().sort({ order: 1, joinedAt: -1 });
    res.json({ success: true, data: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to list members', error: err.message });
  }
});

// Create member (admin)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, photoURL, universityOrRole, roleInCommunity, since, notes, createdByFirebaseUid } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: 'name is required' });

    let createdBy = null;
    if (createdByFirebaseUid) {
      const user = await User.findOne({ firebaseUid: createdByFirebaseUid });
      if (user) createdBy = user._id;
    }

    // Get the highest order value and add 1 for new member
    const maxOrderMember = await Member.findOne().sort({ order: -1 }).select('order');
    const newOrder = maxOrderMember ? (maxOrderMember.order || 0) + 1 : 0;

    const member = new Member({ 
      name, 
      email: email || '', 
      phone: phone || '', 
      photoURL: photoURL || '', 
      universityOrRole: universityOrRole || '',
      roleInCommunity: roleInCommunity || '',
      since: since || null,
      notes: notes || '', 
      order: newOrder,
      createdBy 
    });
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
