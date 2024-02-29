const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai')
const { EventEmitter } = require('events')
const multer = require('multer')
const path = require('path')
const { PDFExtract } = require('pdf.js-extract')
const { encode } = require('gpt-3-encoder')
const axios = require('axios')
const openAiApiRouter = require('./routes/routes')

const app = express()

app.use(express.json())

dotenv.config()
app.use(cors())

const configuration = new Configuration({
  organization: 'org-hlVylsQNv3gdpXxHbosquRRW',
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const openApiError = (res, error) => {
  console.error('Error with OpenAI API request', error.message)
  return res.status(500).json({
    error: {
      message: 'An Error Occured.'
    }
  })
}

app.post('/api/chatbot', async (req, res) => {
  try {
    const { messages } = req.body
    const completion = await runChatbotCompletion(messages, completionConfig)
    res.json({ data: completion.data })
  } catch (error) {
    openApiError(res, error)
  }
})

app.use('/api', openAiApiRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server Started at ${PORT}`))