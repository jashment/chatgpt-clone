const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai')
const { EventEmitter } = require('events')
const multer = require('multer')
const path = require('path')
const { PDFExtract } = require('pdf.js-extract')
const { encode } = require('gpt-3-encoder')


const app = express()

app.use(express.json())

dotenv.config()
app.use(cors())
const completionEmitter = new EventEmitter()

const configuration = new Configuration({
  organization: 'org-hlVylsQNv3gdpXxHbosquRRW',
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const runCompletion = async (prompt) => {
  const response = await openai.createCompletion({
    model: 'gpt-3.5-turbo-instruct',
    prompt: prompt,
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 50,
    echo: true
  })

  return response
}

const startCompletionStream = async (prompt) => {
  const response = await openai.createCompletion({
    model: 'gpt-3.5-turbo-instruct',
    prompt: prompt,
    temperature: 1,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 20,
    stream: true
  }, {
    responseType: 'stream'
  })

  response.data.on('data', data => {
    console.log(data.toString().replace(/^data: /, ''))
    const message = data.toString().replace(/^data: /, '')
    if (message !== '') {
      completionEmitter.emit('data', message)
    } else {
      completionEmitter.emit('Done')
    }
  })
}

app.post('/api/chatgpt-stream', async (req, res) => {

  try {
    const { text } = req.body
    startCompletionStream(text)

    const dataListener = (data) => {
      res.write(data)
    }

    const doneListener = () => {
      res.write('{"event": "done"}')
      res.end()
      completionEmitter.off('data', dataListener)
      completionEmitter.off('Done', doneListener)
    }

    completionEmitter.on('data', dataListener)
    completionEmitter.on('Done', doneListener)

  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error('Error with OpenAI API request', error.message)
      res.status(500).json({
        error: {
          message: 'An Error Occured.'
        }
      })
    }
  }
})

app.post('/api/chatgpt', async (req, res) => {

  try {
    const { text } = req.body
    const completion = await runCompletion(text)
    res.json({ data: completion.data })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error('Error with OpenAI API request', error.message)
      res.status(500).json({
        error: {
          message: 'An Error Occured.'
        }
      })
    }
  }
})

const calculateTokens = (text) => {
  encode(text).length
}

const splitSentence = (sentence, maxChunkSize) => {
  const sentenceChunks = []
  let partialChunk = ''
  const words = sentence.split(' ')

  words.forEach(word => {
    if (calculateTokens(partialChunk + word) < maxChunkSize) {
      partialChunk += word + '.'
    } else {
      sentenceChunks.push(partialChunk.trim())
      partialChunk = word + '.'
    }
  })

  if (partialChunk) sentenceChunks.push(partialChunk.trim())
  return sentenceChunks
}

const splitTextIntoChunks = (text, maxChunkSize) => {
  const chunks = []
  let currentChunk = ''
  const sentences = text.split('.')

  sentences.forEach(sentence => {
    if (calculateTokens(currentChunk) > maxChunkSize) {
      const sentenceChunks = splitSentence(currentChunk, maxChunkSize)
      chunks.push(...sentenceChunks)
    }
    if (calculateTokens(currentChunk + sentence) < maxChunkSize) {
      currentChunk += sentence + '.'
    } else {
      chunks.push(currentChunk.trim())
      currentChunk = sentence + '.'
    }
  })

  if (currentChunk) chunks.push(currentChunk.trim())
  return chunks
}

const upload = multer({ dest: path.join(__dirname, 'pdfsummary') })

app.post('/api/pdf-summary', upload.single('pdf'), async (req, res) => {

  try {
    // res.json({ data: req.file, body: req.body })
    const { maxWords } = req.body
    const pdfFile = req.file

    const pdfExtract = new PDFExtract()

    const extractOptions = {
      firstPage: 1,
      lastPage: undefined,
      password: '',
      verbosity: -1,
      normalizeWhitespace: false,
      disableCombinedTextItems: false
    }
    const data = await pdfExtract.extract(pdfFile.path, extractOptions)

    const pdfText = data.pages.map((page) => page.content.map((item) => item.str).join(' ')).join(' ')

    if (pdfText.length === 0) return res.json({ error: 'Text could not be extracted.' })

    const chunks = splitTextIntoChunks(pdfText, 2000)
    const tokens = chunks.map((chunk) => encode(chunk).length)
    res.json({ chunks, tokens })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error('Error with OpenAI API request', error.message)
      res.status(500).json({
        error: {
          message: 'An Error Occured.'
        }
      })
    }
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server Started at ${PORT}`))