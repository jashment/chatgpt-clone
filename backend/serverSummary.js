const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const { Configuration, OpenAIApi } = require('openai')

const app = express()

app.use(express.json())

dotenv.config()
app.use(cors())

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

app.post('/api/pdf-summary', async (req, res) => {

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