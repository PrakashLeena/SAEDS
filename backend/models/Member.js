const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, lowercase: true, default: '' },
  universityOrRole: { type: String, default: '' },
  phone: { type: String, default: '' },
  photoURL: { type: String, default: '' },
  since: { type: Number, min: 1900, max: new Date().getFullYear() + 1 }, // Year member joined
  joinedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 }, // Display order for drag-and-drop reordering
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

module.exports = mongoose.model('Member', memberSchema);
