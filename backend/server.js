const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai')
const { EventEmitter } = require('events')
const multer = require('multer')
const path = require('path')

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

const upload = multer({dest: path.join(__dirname, 'pdfsummary')})

app.post('/api/pdf-summary', upload.single('pdf'), async (req, res) => {

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

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server Started at ${PORT}`))