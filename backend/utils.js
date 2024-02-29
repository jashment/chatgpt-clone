const multer = require('multer')
const { Configuration, OpenAIApi } = require('openai')
const path = require('path')
const { EventEmitter } = require('events')
const dotenv = require('dotenv')
const { encode } = require('gpt-3-encoder')

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

const summarizeChunk = async (chunk, maxWords, config) => {
  let condition = ''
  if (maxWords) {
    condition = `Summarize this chunk of text with at most ${maxWords} words.`
  }
  try {
    completionConfig.prompt = `Summarize this chunk of text: ${condition} \n"""${chunk}"""\n`
    completionConfig.max_tokens = 2000
    const completion = await openai.createCompletion(config)
    return completion.data.choices[0].text
  } catch (error) {
    console.log("summarizeChunk error", error)
    throw new Error(error)
  }
}

const summarizeChunks = async (chunks) => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const summarizedChunks = await Promise.all(chunks.map(async (chunk) => {
    const result = await summarizeChunk(chunk, null, completionConfig)
    await delay(200)
    return result
  }))

  const concatenatedText = summarizedChunks.join(' ')
  return concatenatedText
}

const runChatCompletion = async (prompt, config) => {
  config.messages = [
    { role: 'system', content: 'You are a doctor.' },
    { role: 'user', content: prompt }
  ]
  const response = await openai.createChatCompletion(config)
  console.log(response)
  return response
}

module.exports = {
  upload,
  completionEmitter,
  configuration,
  openApiError,
  completionConfig,
  runCompletion,
  splitTextIntoChunks,
  startCompletionStream,
  summarizeChunks,
  calculateTokens,
  summarizeChunk,
  runChatCompletion
}