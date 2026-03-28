const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectProgress } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('Admin'), createProject);

router.route('/:id/progress')
  .get(protect, getProjectProgress);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorize('Admin', 'Team Leader'), updateProject)
  .delete(protect, authorize('Admin'), deleteProject);

module.exports = router;
