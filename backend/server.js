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

// app.post('/api/chatgpt-chat', async (req, res) => {
//   try {
//     const { text } = req.body
//     const completion = await runChatCompletion(text, completionConfig)
//     res.json({ data: completion.data })
//   } catch (error) {
//     if (error.response) {
//       console.error(error.response.status, error.response.data)
//       res.status(error.response.status).json(error.response.data)
//     } else {
//       openApiError(res, error)
//     }
//   }
// })

const runFunctionCompletion = async (prompt, config) => {
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

app.post('/api/chatgpt-function', async (req, res) => {
  try {
    const { text } = req.body
    const functionCompletion = await runFunctionCompletion(text, completionConfig)
    const calledFunction = functionCompletion.data.choices[0].message.tool_calls[0].function
    console.log(calledFunction)
    if (!calledFunction) {
      res.json({ data: functionCompletion.data })
      return
    }
    const { name: functionName, arguments: functionArguments } = calledFunction
    const parsedFunctionArguments = JSON.parse(functionArguments)
    console.log(parsedFunctionArguments)
    if (functionName === 'get_current_weather') {
      const weatherObject = await getWeather(parsedFunctionArguments)
      const response = await runFunctionCompletion2(text, functionArguments, weatherObject, completionConfig)


      res.json(response.data)
      return
    }
    

  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      openApiError(res, error)
    }
  }
})

const runChatbotCompletion = async (messages, config) => {
  config.messages = messages
  const response = await openai.createChatCompletion(config)

  return response
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