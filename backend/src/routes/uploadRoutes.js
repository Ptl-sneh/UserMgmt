const express = require('express')
const router = express.Router()

const {uploadFiles} = require('../controllers/fileController')

router.post('/file',uploadFiles)

module.exports = router