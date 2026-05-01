const express = require('express');
const router = express.Router();
const { createTask, getTasksByProject, getTasksByGroup, getTaskById, updateTask, deleteTask, submitTask, evaluateTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('Admin', 'Team Leader', 'Student'), createTask);

router.route('/project/:projectId')
  .get(protect, getTasksByProject);

router.route('/group/:groupId')
  .get(protect, getTasksByGroup);

router.route('/:id/submit')
  .put(protect, authorize('Student', 'Team Leader', 'Admin'), submitTask);

router.route('/:id/evaluate')
  .put(protect, authorize('Admin'), evaluateTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, authorize('Admin', 'Team Leader', 'Student'), updateTask)
  .delete(protect, authorize('Admin', 'Team Leader'), deleteTask);

module.exports = router;
