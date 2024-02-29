const express = require('express')
const { upload } = require('../utils')
const { EventEmitter } = require('events')
const { completionStream, chatCompletion, summarizePdf } = require('../controllers/controllers')

const router = express.Router()

router.post('/chatgpt-stream', completionStream)

router.post('/chatgpt', chatCompletion)

router.post('/pdf-summary', upload.single('pdf'), summarizePdf)

// router.post('/chatgpt-chat')

// router.post('/chatgpt-function')

// router.post('/chatbot')

module.exports = router