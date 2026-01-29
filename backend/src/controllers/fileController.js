const multer = require('multer');
const UploadConfig = require('../models/UploadFile');
const path = require('path');
const fs = require('fs');

const uploadFiles = async (req, res) => {
  try {
    const config = await UploadConfig.findOne({ isActive: true });
    if (!config) {
      return res.status(500).json({ message: 'Upload config not found' });
    }

    // Ensure upload directory exists
    fs.mkdirSync(config.uploadPath, { recursive: true });

    const storage = multer.diskStorage({
      destination: (_, __, cb) => cb(null, config.uploadPath),
      filename: (_, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${Date.now()}${ext}`);
      }
    });

    const upload = multer({
      storage,
      limits: { fileSize: config.maxFileSize },
      fileFilter: (_, file, cb) =>
        config.allowedMimeTypes.includes(file.mimetype)
          ? cb(null, true)
          : cb(new Error('File type not allowed'))
    }).single('file');

    upload(req, res, err => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      res.status(200).json({
        message: 'File uploaded successfully',
        file: {
          filename: req.file.filename,
          path: req.file.path
        }
      });
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { uploadFiles };
