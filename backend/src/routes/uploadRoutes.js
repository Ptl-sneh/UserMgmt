const express = require('express');
const router = express.Router();

const { uploadFiles } = require('../controllers/fileController');
const { checkPermission } = require('../middlewares/permissionMiddleware')
const protect = require('../middlewares/authMiddleware');

// Upload file - requires appropriate permission
router.post('/file', protect, checkPermission('UserManagement' , 'upload file'), uploadFiles);

module.exports = router;