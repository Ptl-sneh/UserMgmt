const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    moduleName: {
        type: String,
        required: true,
        trim: true
    },
    actions: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


module.exports = mongoose.model('Module', permissionSchema);