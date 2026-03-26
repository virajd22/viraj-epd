const Document = require('../models/Document');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { projectId, taskId, type } = req.body;

    const document = await Document.create({
      name: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
      project: projectId || undefined,
      task: taskId || undefined,
      type: type || 'Other'
    });

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { projectId, taskId } = req.query;
    let query = {};
    if (projectId) query.project = projectId;
    if (taskId) query.task = taskId;

    const documents = await Document.find(query).populate('uploadedBy', 'name');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    
    // Authorization check
    if (document.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
