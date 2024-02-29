const express = require('express')
const { upload } = require('../utils')
const { EventEmitter } = require('events')
const {
  chatCompletion,
  completionStream,
  basicCompletion,
  summarizePdf,
  functionToolCompletion
} = require('../controllers/controllers')

const router = express.Router()

router.post('/chatgpt-stream', completionStream)

router.post('/chatgpt', basicCompletion)

router.post('/pdf-summary', upload.single('pdf'), summarizePdf)

router.post('/chatgpt-chat', chatCompletion)

router.post('/chatgpt-function', functionToolCompletion)

// router.post('/chatbot')

module.exports = router