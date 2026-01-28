const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleControllers');
const protect = require("../middlewares/authMiddleware");

router.get('/', protect, moduleController.getModules);

module.exports = router;