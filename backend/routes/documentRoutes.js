const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.route('/')
  .post(protect, upload.single('file'), uploadDocument)
  .get(protect, getDocuments);

router.route('/:id')
  .delete(protect, deleteDocument);

module.exports = router;
