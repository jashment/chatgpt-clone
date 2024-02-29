const express = require('express')
const { upload } = require('../utils')
const { EventEmitter } = require('events')
const { completionStreamController } = require('../controllers/controllers')

const router = express.Router()

router.post('/chatgpt-stream', completionStreamController)

// router.post('/chatgpt')

// router.post('/pdf-summary', upload.single('pdf'))

// router.post('/chatgpt-chat')

// router.post('/chatgpt-function')

// router.post('/chatbot')

module.exports = router