const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  link: { type: String, trim: true },
  type: { type: String, enum: ['assignment', 'material'], required: true },
  deadline: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
