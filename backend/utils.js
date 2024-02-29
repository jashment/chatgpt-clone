const multer = require('multer')
const { Configuration, OpenAIApi } = require('openai')
const path = require('path')
const { EventEmitter } = require('events')
const dotenv = require('dotenv')

dotenv.config()

const openApiError = (res, error) => {
  console.error('Error with OpenAI API request', error.message)
  return res.status(500).json({
    error: {
      message: 'An Error Occured.'
    }
  })
}

const upload = multer({ dest: path.join(__dirname, 'pdfsummary') })

const completionEmitter = new EventEmitter()

const configuration = new Configuration({
  organization: 'org-hlVylsQNv3gdpXxHbosquRRW',
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

const completionConfig = {
  model: 'gpt-3.5-turbo-instruct',
  temperature: 1,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: 50,
}

const runCompletion = async (prompt, config) => {
  config.prompt = prompt
  config.echo = true
  const response = await openai.createCompletion(config)

  return response
}

const startCompletionStream = async (prompt, config) => {
  config.prompt = prompt
  config.stream = true
  const response = await openai.createCompletion(config, {
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

module.exports = {
  upload,
  completionEmitter,
  configuration,
  openApiError,
  completionConfig,
  runCompletion,
  startCompletionStream
}