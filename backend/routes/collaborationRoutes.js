const express = require('express');
const router = express.Router();
const { addComment, getComments, createAnnouncement, getAnnouncements } = require('../controllers/collaborationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/comments')
  .post(protect, addComment)
  .get(protect, getComments);

router.route('/announcements')
  .post(protect, authorize('Admin'), createAnnouncement)
  .get(protect, getAnnouncements);

module.exports = router;
