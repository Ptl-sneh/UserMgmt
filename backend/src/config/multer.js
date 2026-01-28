const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Configure storage
const backendRoot = path.resolve(__dirname, '..', '..');
const exportDir = path.join(backendRoot, 'exports');

// Ensure directory exists
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, exportDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const filename = `users_export_${timestamp}.csv`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;