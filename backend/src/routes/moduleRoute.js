const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleControllers');
const protect = require("../middlewares/authMiddleware");

// @route   GET /api/modules
// @desc    Get modules - pass ?grouped=true for UI display, empty for RoleForm
// @access  Protected
router.get('/', protect, moduleController.getModules);

module.exports = router;