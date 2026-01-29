const mongoose = require('mongoose');
const path = require('path');

const uploadConfigSchema = new mongoose.Schema({
    allowedMimeTypes: {
        type: [String],
        default: ['image/jpeg', 'image/png', 'application/pdf', 'application/json', 'text/csv']
    },
    maxFileSize: {
        type: Number,
        default: 5 * 1024 * 1024 // 5MB default
    },
    uploadPath: {
        type: String,
        default: path.join(__dirname, '../../uploads')
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("UploadConfig", uploadConfigSchema);