const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleControllers');
const protect = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

// @route   GET /api/modules/grouped
// @desc    Get all modules grouped with their actions
// @access  Protected - requires read permission on any module
router.get('/grouped', protect, moduleController.getGroupedModules);

// @route   GET /api/modules/grouped-unique
// @desc    Get all modules grouped with unique actions
// @access  Protected
router.get('/grouped-unique', protect, moduleController.getGroupedModulesUnique);

module.exports = router;