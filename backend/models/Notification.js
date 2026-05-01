const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  actionText: { type: String }, // e.g. "View Task"
  actionUrl: { type: String },  // e.g. "/tasks/123"
  type: { type: String, enum: ['TaskAssigned', 'TaskSubmitted', 'TaskEvaluated', 'System'], default: 'System' },
  relatedTask: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
