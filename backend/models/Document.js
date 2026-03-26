const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  type: { type: String, enum: ['SRS', 'PPT', 'Report', 'Other'], default: 'Other' }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);
