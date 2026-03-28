const express = require('express');
const router = express.Router();
const { sendMessage, getPrivateMessages } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send', protect, sendMessage);
router.get('/:userId', protect, getPrivateMessages);

module.exports = router;
