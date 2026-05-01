const express = require('express');
const router = express.Router();
const { createGroup, joinGroup, getGroups, getGroupById, deleteGroup } = require('../controllers/groupController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createGroup); // Anyone can create groups
router.post('/join', protect, joinGroup);
router.get('/', protect, getGroups);
router.get('/:id', protect, getGroupById);
router.delete('/:id', protect, authorize('Admin'), deleteGroup);

module.exports = router;
