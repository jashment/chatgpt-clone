const multer = require('multer')
const { Configuration, OpenAIApi } = require('openai')
const path = require('path')
const { EventEmitter } = require('events')
const dotenv = require('dotenv')
const { encode } = require('gpt-3-encoder')
const axios = require('axios')

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
    console.error("summarizeChunk error", error)
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
  config.model = 'gpt-3.5-turbo'
  const response = await openai.createChatCompletion(config)

  return response
}

const runFunctionCompletion = async (prompt, config) => {
  config.model = 'gpt-3.5-turbo'
  config.messages = [
      { role: 'user', content: prompt }
  ]
  config.tools = [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ]
  const response = await openai.createChatCompletion(config)

  return response
}

const getWeather = async (parsedFunctionArguments) => {
  const { location } = parsedFunctionArguments
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://api.weatherapi.com/v1/current.json',
      params: { q: location, key: process.env.WEATHER_API_KEY }
    })
    const weather = response.data
    const { condition, temp_c, temp_f } = weather.current
    const unit = parsedFunctionArguments.unit !== 'fahrenheit' ? 'celsius' : 'fahrenheit'
    const temperature = unit === 'celsius' ? temp_c : temp_f
    return { temperature, unit, description: condition.text }
  } catch (error) {
    console.error('There was an error', error)
  }
}

const runFunctionCompletion2 = async (prompt, functionArguments, weatherObject, config) => {
  config.model = 'gpt-3.5-turbo'
  config.messages = [
    { role: 'user', content: prompt },
    {
      role: "assistant",
      content: null,
      function_call: {
        name: "get_current_weather",
        arguments: functionArguments
      }
    },
    {
      role: 'function',
      name: 'get_current_weather',
      content: JSON.stringify(weatherObject)
    },
  ]
  config.tools = [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ]
  const response = await openai.createChatCompletion(config)

  return response
}

const runChatbotCompletion = async (messages, config) => {
  config.messages = messages
  config.model = 'gpt-3.5-turbo'
  const response = await openai.createChatCompletion(config)

  return response
}

module.exports = {
  upload,
  completionEmitter,
  configuration,
  getWeather,
  openApiError,
  completionConfig,
  runCompletion,
  splitTextIntoChunks,
  startCompletionStream,
  summarizeChunks,
  calculateTokens,
  summarizeChunk,
  runChatbotCompletion,
  runChatCompletion,
  runFunctionCompletion,
  runFunctionCompletion2
}