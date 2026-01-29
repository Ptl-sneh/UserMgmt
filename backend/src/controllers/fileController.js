// controllers/fileController.js
const multer = require('multer');
const UploadConfig = require('../models/UploadFile');
const path = require('path');

const uploadFiles = async (req, res) => {
  try {
    // 1. Fetch current config from DB
    const config = await UploadConfig.findOne(); 
    if (!config) return res.status(500).json({ message: "Upload configuration not found in DB." });

    // 2. Configure Multer dynamically
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, config.uploadPath),
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    });

    const upload = multer({
      storage: storage,
      limits: { fileSize: config.maxFileSize },
      fileFilter: (req, file, cb) => {
        if (config.allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Type ${file.mimetype} not allowed.`), false);
        }
      }
    }).single('myFile'); // 'myFile' is the key name for Postman

    // 3. Manually trigger the upload process
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer Error: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) return res.status(400).json({ message: "No file uploaded." });

      res.status(200).json({
        message: "Upload successful!",
        file: req.file
      });
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {uploadFiles}