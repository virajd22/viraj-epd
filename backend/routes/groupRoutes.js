const express = require('express');
const router = express.Router();
const { createGroup, joinGroup, getGroups, getGroupById } = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Admin', 'Faculty'), createGroup); // Assuming Faculty can also create
router.post('/join', protect, joinGroup);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupById);

module.exports = router;
