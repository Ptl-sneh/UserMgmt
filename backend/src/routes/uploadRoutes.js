const express = require('express');
const router = express.Router();

const { 
  uploadFiles
} = require('../controllers/fileController');

const protect = require('../middlewares/authMiddleware');

// Upload file - requires appropriate permission
router.post('/file', protect, uploadFiles);

module.exports = router;