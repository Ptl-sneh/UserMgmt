const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    allowedMimeType : {
        type : [String],
        default : ['image/jpeg','image/png','application/pdf','application/json', 'text/csv']
    },
    maxFileSize : {
        type : Number,
        defualt : 1024 * 1024 * 5
    },
    uploadPath :{
        type : String,
        defult : 'uploads/'
    }
})

module.exports = mongoose.model("UploadFile",fileSchema)